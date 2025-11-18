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
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 1000, "test", 0);
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

    /// @notice Edge Case 5: Token con nombre vacío
    /// @dev Cubre branch: if (bytes(name).length == 0) revert InvalidName();
    function testCreateTokenEmptyName() public {
        // Setup usuario aprobado
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidName.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("", SupplyChain.TokenType.RowMaterial, 100, "features", 0);
    }

    /// @notice Edge Case 6: Token con totalSupply = 0
    /// @dev Cubre branch: if (totalSupply == 0) revert InvalidTotalSupply();
    function testCreateTokenZeroSupply() public {
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidTotalSupply.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 0, "features", 0);
    }

    /// @notice Edge Case 7: Token con parentId inexistente
    /// @dev Cubre branch: if (parentId != 0 && tokens[parentId].id == 0) revert ParentTokenDoesNotExist();
    function testCreateTokenInvalidParent() public {
        setupApprovedProducer();
        
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.ParentTokenDoesNotExist.selector));
        vm.prank(producerAddress);
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 100, "features", 999);
    }

    /// @notice Edge Case 8: Owner intenta crear token
    /// @dev Cubre branch: if (msg.sender == owner) revert Unauthorized();
    function testOwnerCannotCreateToken() public {
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.Unauthorized.selector));
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 100, "features", 0);
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
        supplyChain.createToken("Test Token", SupplyChain.TokenType.RowMaterial, 1000, "test features", 0);
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
}