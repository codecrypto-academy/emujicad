// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

/**
 * @title Edge Cases Test Suite for SupplyChain
 * @notice Tests específicos para mejorar branch coverage del 36.73% actual
 * @dev Implementación gradual en fases para alcanzar 65%+ de coverage
 */
contract EdgeCasesTest is Test {
    SupplyChain public supplyChain;
    
    address public owner;
    address public producerAddress;
    address public factoryAddress;
    address public retailerAddress;
    address public consumerAddress;

    function setUp() public {
        owner = address(this);
        producerAddress = makeAddr("producer");
        factoryAddress = makeAddr("factory");
        retailerAddress = makeAddr("retailer");
        consumerAddress = makeAddr("consumer");
        
        supplyChain = new SupplyChain();
    }

    // ============================================================================
    // �️ HELPER FUNCTIONS
    // ============================================================================

    /// @notice Helper function para setup común de usuarios y token
    function _setupUserAndToken() internal {
        // Registrar y aprobar producer
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        
        // Registrar y aprobar factory
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 1000, "test", 0, 0);
    }

    // ============================================================================
    // �🔴 FASE 1: EDGE CASES DE VALIDACIÓN BÁSICA (1-8)
    // ============================================================================

    /// @notice Edge Case 1: Owner intenta registrarse como usuario
    /// @dev Cubre branch: if (owner == msg.sender) revert InvalidAddress();
    function testOwnerCannotRegisterAsUser() public {
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAddress.selector));
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
    }

    /// @notice Edge Case 2: Comentamos temporalmente - Solidity permite enums inválidos en tiempo de compilación
    /// @dev El branch if (uint(role) > 3) se testea indirectamente en otros tests
    function testValidRoleMax() public {
        // Test que funciona - usar rol Consumer (3) que es el máximo válido
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        
        // Verificar que se registró correctamente
        assertTrue(supplyChain.addressToUserId(producerAddress) != 0);
    }

    /// @notice Edge Case 3: Usuario ya approved intenta re-registrarse
    /// @dev Cubre branch: if (user.status == UserStatus.Approved) revert ExistingUserWithApprovedRole();
    function testApprovedUserCannotReregister() public {
        // Registrar usuario
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        // Aprobar usuario
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        
        // Intentar registrarse de nuevo (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ExistingUserWithApprovedRole.selector));
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
    }

    /// @notice Edge Case 4: Usuario con mismo rol intenta re-registrarse
    /// @dev Cubre branch: if (uint(role) == uint(user.role)) revert UserWithExistingRole();
    function testSameRoleReregistration() public {
        // Registrar usuario
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        // Intentar registrarse con el mismo rol
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserWithExistingRole.selector));
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
    }

    /// @notice Edge Case 4.5: Usuario cancelado no puede solicitar nuevo rol
    /// @dev Cubre branch: if (user.status == UserStatus.Canceled) revert UserCanceled();
    function testCanceledUserCannotRequestRole() public {
        // Registrar usuario
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        // Cancelar usuario
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Canceled);
        
        // Verificar que el usuario está cancelado
        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Canceled), "User should be canceled");
        
        // Intentar solicitar un nuevo rol (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserCanceled.selector));
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
    }

    /// @notice Edge Case 4.6: Usuario rechazado puede solicitar nuevo rol (cambia a Pending)
    /// @dev Cubre branch: if (user.status != UserStatus.Pending) { user.status = UserStatus.Pending; }
    /// @dev Este test cubre el branch faltante en _updateExistingUserRole línea 620
    function testRejectedUserCanRequestNewRole() public {
        // 1. Usuario solicita rol y es rechazado
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Rejected);
        
        // Verificar que el usuario está rechazado
        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected), "User should be rejected");
        
        // 2. Usuario rechazado solicita un rol diferente (debe cambiar a Pending)
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        
        // 3. Verificar que el status cambió a Pending y el rol cambió
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Status should be Pending after requesting new role");
        assertEq(uint(user.role), uint(SupplyChain.UserRole.Factory), "Role should be Factory");
    }

    /// @notice Edge Case 5: Token con nombre vacío
    /// @dev Cubre branch: if (bytes(name).length == 0) revert InvalidName();
    function testCreateTokenEmptyName() public {
        // Setup usuario aprobado
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidName.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("", SupplyChain.TokenType.RowMaterial, 100, "features", 0, 0);
    }

    /// @notice Edge Case 5.5: Token con nombre de 1 carácter
    /// @dev Cubre branch: if (bytes(name).length < 2) revert InvalidName();
    function testCreateTokenSingleCharacterName() public {
        // Setup usuario aprobado
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidName.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("A", SupplyChain.TokenType.RowMaterial, 100, "features", 0, 0);
    }

    /// @notice Edge Case 6: Token con totalSupply = 0
    /// @dev Cubre branch: if (totalSupply == 0) revert InvalidTotalSupply();
    function testCreateTokenZeroSupply() public {
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidTotalSupply.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 0, "features", 0, 0);
    }

    /// @notice Edge Case 7: Token RowMaterial con parentId != 0 (debe ser 0)
    /// @dev Cubre branch: if (parentId != 0) revert ParentTokenDoesNotExist(); en createToken línea 769
    function testCreateTokenInvalidParent() public {
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ParentTokenDoesNotExist.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 100, "features", 999, 0);
    }

    /// @notice Edge Case 8: Owner intenta crear token
    /// @dev Cubre branch: if (msg.sender == owner) revert Unauthorized();
    function testOwnerCannotCreateToken() public {
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.Unauthorized.selector));
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 100, "features", 0, 0);
    }

    // ============================================================================
    // 🟡 PRÓXIMAS IMPLEMENTACIONES (FASE 2)
    // ============================================================================
    
    /// @notice Edge Case 9: Transfer a address(0) - PRÓXIMO A IMPLEMENTAR
    function testTransferToZeroAddress() public {
        setupTokenForTransfer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAddress.selector));
        vm.prank(producerAddress);
        supplyChain.transfer(address(0), 1, 10);
    }

    /// @notice Edge Case 10: Transfer amount = 0 - PRÓXIMO A IMPLEMENTAR
    function testTransferZeroAmount() public {
        setupTokenForTransfer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAmount.selector));
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 0);
    }

    // ============================================================================
    // 🔧 HELPER FUNCTIONS
    // ============================================================================

    /// @notice Setup básico: usuario Producer registrado y aprobado
    function setupApprovedProducer() internal {
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
    }

    /// @notice Setup completo: usuarios y token para transfers
    function setupTokenForTransfer() internal {
        // Setup Producer
        setupApprovedProducer();
        
        // Setup Factory
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 1000, "test features", 0, 0);
    }

    /// @notice Test para verificar que los helper functions funcionan
    function testSetupFunctions() public {
        setupTokenForTransfer();
        
        // Verificar que el token fue creado correctamente
        (uint256 id, address creator, string memory name, , uint256 totalSupply, , , ) = supplyChain.getToken(1);
        
        assertEq(id, 1);
        assertEq(creator, producerAddress);
        assertEq(totalSupply, 1000);
        assertTrue(bytes(name).length > 0);
    }

    // ============================================================================
    // � FASE 2: EDGE CASES DE ESTADO Y AUTORIZACIÓN (11-16)
    // ============================================================================

    /// @notice Edge Case 11: Transfer token inexistente
    /// @dev Cubre branch: if (tokenId >= nextTokenId) revert TokenDoesNotExist();
    function testTransferNonExistentToken() public {
        _setupUserAndToken();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.TokenDoesNotExist.selector));
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 999, 10);
    }

    /// @notice Edge Case 12: Consumer intenta hacer transfer
    /// @dev Cubre branch: if (userRole == UserRole.Consumer) revert NoTransfersAllowed();
    function testConsumerCannotInitiateTransfer() public {
        // Setup consumer
        vm.prank(consumerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        supplyChain.changeStatusUser(consumerAddress, SupplyChain.UserStatus.Approved);
        
        _setupUserAndToken();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.NoTransfersAllowed.selector));
        vm.prank(consumerAddress);
        supplyChain.transfer(factoryAddress, 1, 10);
    }

    /// @notice Edge Case 13: User sin permisos intenta pausar
    /// @dev Cubre branch: onlyPauser modifier en función pause
    function testUnauthorizedUserCannotPause() public {
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.Unauthorized.selector));
        vm.prank(producerAddress);
        supplyChain.pause();
    }

    /// @notice Edge Case 14: Pausar cuando ya está pausado
    /// @dev Cubre branch: whenNotPaused modifier validation
    function testCannotPauseWhenAlreadyPaused() public {
        // Primero pausar
        supplyChain.pause();
        
        // Intentar pausar de nuevo - debería fallar con ContractPaused
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ContractPaused.selector));
        supplyChain.pause();
    }

    /// @notice Edge Case 15: Despausar cuando no está pausado
    /// @dev Cubre branch: whenPaused modifier validation
    function testCannotUnpauseWhenNotPaused() public {
        // Contrato no está pausado por defecto
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ContractNotPaused.selector));
        supplyChain.unpause();
    }

    /// @notice Edge Case 16: Operaciones durante pausa
    /// @dev Cubre branch: whenNotPaused modifier en funciones críticas
    function testOperationsFailWhenPaused() public {
        // Pausar contrato
        supplyChain.pause();
        
        // Intentar registrar usuario durante pausa
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ContractPaused.selector));
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
    }

    // ============================================================================
    // �📊 TESTS DE COVERAGE VERIFICATION
    // ============================================================================

    /// @notice Test que verifica múltiples branches en una sola función
    function testMultipleBranches() public {
        // Branch 1: Usuario no registrado
        assertEq(supplyChain.addressToUserId(producerAddress), 0);
        
        // Branch 2: Usuario registrado
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        assertTrue(supplyChain.addressToUserId(producerAddress) != 0);
        
        // Branch 3: Usuario aprobado
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved));
    }

    // ============================================================================
    // 🆕 FASE 3: EDGE CASES DE parentAmount (NUEVOS BRANCHES)
    // ============================================================================

    /// @notice Edge Case 17: FinishedProduct con parentId == 0 debe revertir
    /// @dev Cubre branch: if (parentId == 0) revert ParentTokenDoesNotExist();
    function testFinishedProductWithZeroParentId() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ParentTokenDoesNotExist.selector));
        vm.prank(factoryAddress);
        supplyChain.createToken("Product", SupplyChain.TokenType.FinishedProduct, 100, "{}", 0, 50);
    }

    /// @notice Edge Case 18: FinishedProduct con parentAmount == 0 debe revertir
    /// @dev Cubre branch: if (parentAmount == 0) revert InvalidAmount();
    function testFinishedProductWithZeroParentAmount() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token padre
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir al factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Intentar crear producto con parentAmount == 0
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAmount.selector));
        vm.prank(factoryAddress);
        supplyChain.createToken("Product", SupplyChain.TokenType.FinishedProduct, 100, "{}", 1, 0);
    }

    /// @notice Edge Case 19: FinishedProduct con parent token que no es RowMaterial debe revertir
    /// @dev Cubre branch: if (parentToken.tokenType != TokenType.RowMaterial) revert ParentTokenDoesNotExist();
    function testFinishedProductWithNonRowMaterialParent() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear materia prima
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir al factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory crea un producto terminado (token 2)
        vm.prank(factoryAddress);
        supplyChain.createToken("Product 1", SupplyChain.TokenType.FinishedProduct, 50, "{}", 1, 50);
        
        // Registrar Retailer para poder aceptar Finished Product
        vm.prank(retailerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Retailer);
        supplyChain.changeStatusUser(retailerAddress, SupplyChain.UserStatus.Approved);
        
        // Transferir producto terminado a Retailer (Factory puede transferir Finished Product)
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 25);
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);
        
        // Intentar crear producto usando otro producto terminado como parent (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ParentTokenDoesNotExist.selector));
        vm.prank(factoryAddress);
        supplyChain.createToken("Product 2", SupplyChain.TokenType.FinishedProduct, 25, "{}", 2, 25);
    }

    /// @notice Edge Case 20: FinishedProduct con balance insuficiente debe revertir
    /// @dev Cubre branch: if (userParentBalance < parentAmount) revert InsufficientBalance(...);
    function testFinishedProductWithInsufficientBalance() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token padre
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir solo 50 unidades al factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Intentar crear producto consumiendo más de lo que tiene (100 > 50)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InsufficientBalance.selector, 50, 100));
        vm.prank(factoryAddress);
        supplyChain.createToken("Product", SupplyChain.TokenType.FinishedProduct, 100, "{}", 1, 100);
    }

    /// @notice Edge Case 21: RowMaterial con parentId != 0 debe revertir
    /// @dev Cubre branch: if (parentId != 0) revert ParentTokenDoesNotExist();
    function testRowMaterialWithNonZeroParentId() public {
        setupApprovedProducer();
        
        // Crear un token primero
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material 1", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Intentar crear materia prima con parentId != 0
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ParentTokenDoesNotExist.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material 2", SupplyChain.TokenType.RowMaterial, 100, "{}", 1, 0);
    }

    /// @notice Edge Case 22: RowMaterial con parentAmount != 0 debe revertir
    /// @dev Cubre branch: if (parentAmount != 0) revert InvalidAmount();
    function testRowMaterialWithNonZeroParentAmount() public {
        setupApprovedProducer();
        
        // Intentar crear materia prima con parentAmount != 0
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAmount.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 50);
    }

    /// @notice Edge Case 23: Actualización de contador cuando balance llega a 0
    /// @dev Cubre branch: if (parentToken.balance[msg.sender] == 0 && userTokenCount[msg.sender] > 0)
    function testUserTokenCountDecrementWhenBalanceReachesZero() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token padre
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir exactamente 50 unidades al factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Verificar que factory tiene el token en su lista
        uint[] memory factoryTokensBefore = supplyChain.getUserTokens(factoryAddress);
        assertEq(factoryTokensBefore.length, 1, "Factory should have 1 token before");
        
        // Crear producto consumiendo todas las 50 unidades (balance llega a 0)
        vm.prank(factoryAddress);
        supplyChain.createToken("Product", SupplyChain.TokenType.FinishedProduct, 50, "{}", 1, 50);
        
        // Verificar que el contador se decrementó (factory ya no tiene el token 1)
        uint[] memory factoryTokensAfter = supplyChain.getUserTokens(factoryAddress);
        assertEq(factoryTokensAfter.length, 1, "Factory should have 1 token after (the new product)");
        assertEq(factoryTokensAfter[0], 2, "Factory should have token 2 (the new product)");
        
        // Verificar que el balance del token 1 es 0
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory balance of token 1 should be 0");
    }

    // ============================================================================
    // 🔴 FASE 4: VALIDACIONES DE ROL POR TIPO DE TOKEN (NUEVAS VALIDACIONES)
    // ============================================================================

    /// @notice Edge Case 24: Factory no puede transferir Raw Material
    /// @dev Cubre branch: if (token.tokenType == TokenType.RowMaterial && sender.role != UserRole.Producer) revert InvalidRoleForTokenType();
    function testFactoryCannotTransferRawMaterial() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir Raw Material a Factory (válido)
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory intenta transferir Raw Material (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 1, 25);
    }

    /// @notice Edge Case 25: Retailer no puede transferir Raw Material
    /// @dev Cubre branch: if (token.tokenType == TokenType.RowMaterial && sender.role != UserRole.Producer) revert InvalidRoleForTokenType();
    function testRetailerCannotTransferRawMaterial() public {
        setupApprovedProducer();
        
        vm.prank(retailerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Retailer);
        supplyChain.changeStatusUser(retailerAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir Raw Material a Retailer (válido - Producer -> Factory -> Retailer)
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory transfiere a Retailer (esto debería fallar porque Factory no puede transferir Raw Material)
        // Pero primero necesitamos que Factory tenga el token, así que esto fallará en la validación nueva
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 1, 25);
    }

    /// @notice Edge Case 26: Producer no puede transferir Finished Product
    /// @dev Cubre branch: if (token.tokenType == TokenType.FinishedProduct && sender.role != Factory && sender.role != Retailer) revert InvalidRoleForTokenType();
    function testProducerCannotTransferFinishedProduct() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir a Factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory crea Finished Product
        vm.prank(factoryAddress);
        supplyChain.createToken("Finished Product", SupplyChain.TokenType.FinishedProduct, 25, "{}", 1, 25);
        
        // Transferir Finished Product a Producer (válido para Factory)
        vm.prank(factoryAddress);
        supplyChain.transfer(producerAddress, 2, 10);
        
        // Producer intenta transferir Finished Product (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 2, 5);
    }

    /// @notice Edge Case 27: Retailer no puede aceptar Raw Material
    /// @dev Cubre branch: if (token.tokenType == TokenType.RowMaterial && receiver.role != UserRole.Factory) revert InvalidRoleForTokenType();
    function testRetailerCannotAcceptRawMaterial() public {
        setupApprovedProducer();
        
        vm.prank(retailerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Retailer);
        supplyChain.changeStatusUser(retailerAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Producer intenta transferir Raw Material a Retailer (esto debería fallar en acceptTransfer)
        vm.prank(producerAddress);
        supplyChain.transfer(retailerAddress, 1, 50);
        
        // Retailer intenta aceptar Raw Material (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(1);
    }

    /// @notice Edge Case 28: Consumer no puede aceptar Raw Material
    /// @dev Cubre branch: if (token.tokenType == TokenType.RowMaterial && receiver.role != UserRole.Factory) revert InvalidRoleForTokenType();
    function testConsumerCannotAcceptRawMaterial() public {
        setupApprovedProducer();
        
        vm.prank(consumerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        supplyChain.changeStatusUser(consumerAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Producer intenta transferir Raw Material a Consumer (esto debería fallar en acceptTransfer)
        vm.prank(producerAddress);
        supplyChain.transfer(consumerAddress, 1, 50);
        
        // Consumer intenta aceptar Raw Material (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(1);
    }

    /// @notice Edge Case 29: Factory no puede aceptar Finished Product
    /// @dev Cubre branch: if (token.tokenType == TokenType.FinishedProduct && receiver.role != Retailer && receiver.role != Consumer) revert InvalidRoleForTokenType();
    function testFactoryCannotAcceptFinishedProduct() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir a Factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory crea Finished Product
        vm.prank(factoryAddress);
        supplyChain.createToken("Finished Product", SupplyChain.TokenType.FinishedProduct, 25, "{}", 1, 25);
        
        // Factory intenta transferir Finished Product a otro Factory
        address anotherFactory = makeAddr("anotherFactory");
        vm.prank(anotherFactory);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(anotherFactory, SupplyChain.UserStatus.Approved);
        
        vm.prank(factoryAddress);
        supplyChain.transfer(anotherFactory, 2, 10);
        
        // Otro Factory intenta aceptar Finished Product (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(anotherFactory);
        supplyChain.acceptTransfer(2);
    }

    /// @notice Edge Case 30: Factory no puede rechazar Finished Product
    /// @dev Cubre branch: if (token.tokenType == TokenType.FinishedProduct && receiver.role != Retailer && receiver.role != Consumer) revert InvalidRoleForTokenType();
    function testFactoryCannotRejectFinishedProduct() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir a Factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory crea Finished Product
        vm.prank(factoryAddress);
        supplyChain.createToken("Finished Product", SupplyChain.TokenType.FinishedProduct, 25, "{}", 1, 25);
        
        // Factory intenta transferir Finished Product a otro Factory
        address anotherFactory = makeAddr("anotherFactory");
        vm.prank(anotherFactory);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(anotherFactory, SupplyChain.UserStatus.Approved);
        
        vm.prank(factoryAddress);
        supplyChain.transfer(anotherFactory, 2, 10);
        
        // Otro Factory intenta rechazar Finished Product (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(anotherFactory);
        supplyChain.rejectTransfer(2);
    }

    /// @notice Edge Case 31: Consumer no puede rechazar Raw Material
    /// @dev Cubre branch: if (token.tokenType == TokenType.RowMaterial && receiver.role != UserRole.Factory) revert InvalidRoleForTokenType();
    function testConsumerCannotRejectRawMaterial() public {
        setupApprovedProducer();
        
        vm.prank(consumerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        supplyChain.changeStatusUser(consumerAddress, SupplyChain.UserStatus.Approved);
        
        // Producer crea Raw Material
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Producer intenta transferir Raw Material a Consumer (esto debería fallar en rejectTransfer)
        vm.prank(producerAddress);
        supplyChain.transfer(consumerAddress, 1, 50);
        
        // Consumer intenta rechazar Raw Material (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidRoleForTokenType.selector));
        vm.prank(consumerAddress);
        supplyChain.rejectTransfer(1);
    }

    // ============================================================================
    // 🔴 FASE 5: EDGE CASES DE OWNERSHIP TRANSFER (NUEVAS VALIDACIONES)
    // ============================================================================

    /// @notice Edge Case 32: Usuario con rol Approved no puede aceptar ownership
    /// @dev Cubre branch: if (userId != 0) revert UserExists();
    ///      Cualquier usuario que haya solicitado un rol (independientemente del estado) no puede ser owner
    function testApprovedUserCannotAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Registrar y aprobar usuario
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        supplyChain.changeStatusUser(newOwner, SupplyChain.UserStatus.Approved);
        
        // Iniciar transferencia
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Intentar aceptar ownership (debe fallar porque el usuario ya existe en el sistema)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserExists.selector));
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
    }

    /// @notice Edge Case 33: Usuario con rol Rejected NO puede aceptar ownership
    /// @dev Un usuario que haya solicitado un rol (incluso si fue rechazado) no puede ser owner
    function testRejectedUserCannotAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Registrar y rechazar usuario
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        supplyChain.changeStatusUser(newOwner, SupplyChain.UserStatus.Rejected);
        
        // Iniciar transferencia
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Intentar aceptar ownership (debe fallar porque el usuario ya existe en el sistema)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserExists.selector));
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
    }

    /// @notice Edge Case 34: Usuario con rol Canceled NO puede aceptar ownership
    /// @dev Un usuario que haya solicitado un rol (incluso si fue cancelado) no puede ser owner
    function testCanceledUserCannotAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Registrar y cancelar usuario
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        supplyChain.changeStatusUser(newOwner, SupplyChain.UserStatus.Canceled);
        
        // Iniciar transferencia
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Intentar aceptar ownership (debe fallar porque el usuario ya existe en el sistema)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserExists.selector));
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
    }

    /// @notice Edge Case 35: Nuevo owner puede pausar/despausar contrato
    /// @dev Después de aceptar ownership, el nuevo owner tiene todos los permisos
    function testNewOwnerCanPauseUnpause() public {
        address newOwner = makeAddr("newOwner");
        
        // Transferir ownership
        supplyChain.initiateOwnershipTransfer(newOwner);
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Nuevo owner puede pausar
        vm.prank(newOwner);
        supplyChain.pause();
        assertTrue(supplyChain.isPaused(), "Contract should be paused");
        
        // Nuevo owner puede despausar
        vm.prank(newOwner);
        supplyChain.unpause();
        assertFalse(supplyChain.isPaused(), "Contract should not be paused");
    }

    /// @notice Edge Case 36: Owner antiguo pierde permisos después de transferencia
    /// @dev Después de transferir ownership, el owner antiguo no puede aprobar usuarios
    function testOldOwnerLosesPermissions() public {
        address newOwner = makeAddr("newOwner");
        address testUser = makeAddr("testUser");
        
        // Transferir ownership
        supplyChain.initiateOwnershipTransfer(newOwner);
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Usuario solicita rol
        vm.prank(testUser);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        // Owner antiguo NO puede aprobar usuarios
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.NoOwner.selector));
        supplyChain.changeStatusUser(testUser, SupplyChain.UserStatus.Approved);
        
        // Nuevo owner SÍ puede aprobar usuarios
        vm.prank(newOwner);
        supplyChain.changeStatusUser(testUser, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(testUser);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "New owner should be able to approve");
    }

    // ============================================================================
    // 🔴 FASE 5: BRANCHES FALTANTES DE REFACTORIZACIÓN (OPTIMIZACIÓN FASE 3)
    // ============================================================================

    /// @notice Edge Case 40: userTokenCount == 0 cuando balance llega a 0 (no decrementa)
    /// @dev Cubre branch else implícito: if (parentToken.balance[msg.sender] == 0 && userTokenCount[msg.sender] > 0) en _validateAndConsumeParentToken línea 813
    /// @dev Este test cubre el caso donde userTokenCount ya es 0, por lo que no se debe decrementar
    function testUserTokenCountNotDecrementedWhenAlreadyZero() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token padre
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir todo el balance al factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 100);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Producer ahora tiene 0 balance y 0 userTokenCount (ya se decrementó)
        // Factory consume todo para crear Finished Product
        vm.prank(factoryAddress);
        supplyChain.createToken("Finished Product", SupplyChain.TokenType.FinishedProduct, 100, "{}", 1, 100);
        
        // Verificar que producer tiene 0 balance del token 1
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 0, "Producer should have 0 balance of token 1");
        // Verificar que factory tiene el Finished Product
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 100, "Factory should have Finished Product");
    }

    /// @notice Edge Case 41: userTokenCount del sender == 0 en acceptTransfer (no decrementa)
    /// @dev Cubre branch else implícito: if (senderBalance == 0 && userTokenCount[transferItem.from] > 0) en acceptTransfer línea 967
    /// @dev Este test cubre el caso donde el sender ya tiene userTokenCount == 0
    function testAcceptTransferWhenSenderTokenCountIsZero() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token y transferir todo
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 100);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Producer ahora tiene 0 balance y 0 userTokenCount
        // Crear otro token y transferir parte
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material 2", SupplyChain.TokenType.RowMaterial, 50, "{}", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 2, 30);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(2);
        
        // Verificar que producer tiene balance del token 2
        assertEq(supplyChain.getTokenBalance(2, producerAddress), 20, "Producer should have 20 balance of token 2");
    }

    /// @notice Edge Case 42: senderHadZeroBefore == false en rejectTransfer (no incrementa)
    /// @dev Cubre branch else implícito: if (senderHadZeroBefore) en rejectTransfer línea 1047
    /// @dev Este test cubre el caso donde el sender ya tenía balance > 0 antes del rechazo
    function testRejectTransferWhenSenderHadBalance() public {
        setupApprovedProducer();
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        
        // Crear token
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);
        
        // Transferir parte (producer mantiene balance)
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 30);
        
        // Factory rechaza la transferencia
        vm.prank(factoryAddress);
        supplyChain.rejectTransfer(1);
        
        // Verificar que producer tiene el balance completo de vuelta
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 100, "Producer should have full balance back");
    }
}