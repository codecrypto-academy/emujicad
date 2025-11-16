// SPDX-License-Identifier: MIT
// Define la versión del compilador de Solidity a utilizar.
// En este caso, es compatible con versiones desde 0.8.2 hasta antes de 0.9.0.

pragma solidity ^0.8.13;

/**
 * @title SupplyChain
 * @notice Solucion de SupplyChain.Este contrato inteligente simula una plataforma de SupplyChain básica en la blockchain.
 * @dev Incluye control de acceso por usuario, validaciones, errores personalizados, contadores para IDs automáticos,
 *      eventos para la comunicación con el exterior y funciones de consulta (getters) completas.
 * @dev IMPORTANTE: Este contrato no maneja transferencias de fondos (criptomonedas), solo registra datos.
 *      Está diseñado con fines educativos y del proyecto PFM para mostrar cómo se pueden anidar mappings y estructurar
 *      datos complejos en Solidity, una práctica común para simular bases de datos en la blockchain.
 */

contract SupplyChain {

    error NoApproved(); // Se emite cuando una dirección no autorizada intenta ejecutar una función protegida.

    error InvalidEntry(string campo); // Para entradas de datos no válidas, como un nombre.
    error InvalidAddress(string message); // Si la direccion es invalida o no existe.
    error Unauthorized(string message); // Se emite cuando una dirección no autorizada intenta ejecutar una función protegida.
    error ExistingUserWithApprovedRole(string message); // Si se intenta registrar una empresa con una dirección que ya existe. 
    error UserWithExistingRole(string message); // Si se intenta registrar una empresa con una dirección que ya existe.

    //Estados del usuario 
    enum UserStatus { 
        Pending,    //Valor 0 
        Approved,   //Valor 1
        Rejected,   //Valor 2
        Canceled    //Valor 3
    }

    enum UserRole { 
        Producer,   //Valor 0
        Factory,    //Valor 1
        Retailer,   //Valor 2
        Consumer    //Valor 3
    }

    // Estados de transferencia 
    enum TransferStatus {
        Pending,    //Valor 0
        Accepted,   //Valor 1
        Rejected    //Valor 2
    }

    // Tipo de token 
    enum TokenType {
        RowMaterial,       //Valor 0
        FinishedProduct    //Valor 1
    }

/*
   struct User {
        uint256 id;
        address userAddress;
        string role;
        UserStatus status;
    }
*/

   struct User {
        uint256 id;
        address userAddress;
        UserRole role;
        UserStatus status;
    }

    struct Token {
        uint256 id;        // Token ID
        address creator;   // Dirección del creador del token
        string name;       // Nombre del token
        TokenType tokenType; // Tipo de token 
        uint256 totalSupply; // Suministro o cantidad total del token
        string features;   // Características del token (JSON string)
        uint256 parentId;  // ID del token padre (si es un token hijo) , 0 si es un token de materia prima y !=0 si es producto terminado
        uint256 dateCreated;    // Fecha de creación del token
        mapping(address => uint256) balance;    // Mapeo de balances por dirección
    }

    struct Transfer {
        uint256 id;       // ID de la transferencia
        address from;     // Dirección del remitente
        address to;       // Dirección del destinatario
        uint256 tokenId;  // ID del token a transferir
        uint256 dateCreated; // Fecha de creación de la transferencia
        uint256 amount;   // Cantidad de tokens transferidos
        TransferStatus status;
    }
 
    address public owner;   // Dirección del administrador/dueño del contrato
    
    // Contadores para los ids de los usurios, tokens y transferencias
    uint256 public nextUserId = 1;       // ID del próximo usuario
    uint256 public nextTokenId = 1;     // ID del próximo token
    uint256 public nextTransferId = 1;   // ID de la próxima transferencia
    
    // mapping para usuarios, los tokens y las transferencias

    /**
     * @notice Almacena todas los usuarios registrados por su id.
     * @dev `mapping(uint256 => User)`: Asocia una el id del usuario (clave)
     *      con la estructura de datos `User` (el valor). Es `private` para controlar el acceso.
     */

    mapping(uint256 => User) public users;               // Mapeo de users por ID
      /**
     * @notice Almacena todas los id de usuario registrados por su direcciones de las billeteras.
     * @dev `mapping(address => uint256)`: Asocia una dirección de billetera (la clave) del User
     *      con el id asignado al `User` (el valor). Es `private` para controlar el acceso.
     */

    mapping(address => uint256) public addressToUserId;  // Mapeo de direcciones a IDs de usuario

    mapping(uint256 => Token) public tokens;             // Mapeo de tokens por ID
    mapping(address => uint) public userTokenCount;
    
    mapping(uint256 => Transfer) public transfers;       // Mapeo de transfers por ID

    event AssignContratOwner(address indexed nuevoPropietarioContrato);

    // eventos para los users tokens y transfers
    //event UserRoleRequested(address indexed user, string role); // Evento de solicitud de rol de usuario
    event UserRoleRequested(address indexed user, UserRole role); // Evento de solicitud de rol de usuario
    event UserStatusChanged(address indexed user, UserStatus status); // Evento de cambio de estado de usuario


    event TokenCreated(uint256 indexed tokenId, address indexed creator, string name, uint256 totalSupply); // Evento de creación de token
    event TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount); // Evento de solicitud de transferencia
    event TransferAccepted(uint256 indexed transferId); // Evento de aceptación de transferencia
    event TransferRejected(uint256 indexed transferId); // Evento de rechazo de transferencia

    constructor() {
        owner = msg.sender; // Establece el administrador del contrato como el creador del contrato
        emit AssignContratOwner(owner);
    }   
    
    // --- Modificadores (Modifiers) ---
    // Los modificadores son código reutilizable que se puede añadir a las funciones para
    // verificar condiciones (permisos, estados, etc.) antes de que se ejecuten.

    /**
     * @dev Verifica que quien llama a la función (`msg.sender`) es el dueño o administrador del contrato.
     *      o el propietario del contrato. Si no, revierte la transacción.
     */
    modifier onlyTokenCreators() {
        require(msg.sender != address(0), "Direccion invalida para hacer esta solicitud");
        require(msg.sender != owner, "El dueno del contrato no puede crear tokens");
        User storage user = users[addressToUserId[msg.sender]];
        require((user.role == UserRole.Producer || user.role == UserRole.Factory) && user.status == UserStatus.Approved, "No posee el rol o su usuario no esta aprobado");  
        _; // Este símbolo especial indica que se debe ejecutar el cuerpo de la función que usa el modificador.
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "No es el administrador o dueno del contrato");
        _; // Este símbolo especial indica que se debe ejecutar el cuerpo de la función que usa el modificador.
    }



    // Gestión de Usuarios
    //function requestUserRole(string memory role) public { 
    function requestUserRole(UserRole role) public { 
        uint256 userId;

        if (msg.sender == address(0) || owner == msg.sender ) revert InvalidAddress("Direccion invalida para hacer esta solicitud");

        //if (bytes(role).length == 0) revert InvalidEntry("role");
        if (uint(role) > 3 ) revert InvalidEntry("Error: No es un rol admitido");

        // `storage` crea una referencia a la variable en el almacenamiento de la blockchain.
        // Modificar `u` modifica directamente el estado del contrato.

        userId = addressToUserId[msg.sender];
        bool userExists = (userId != 0);
        if ( userExists) {
            
            //userRole=u.role;
            User storage u = users[userId];

            //if (uint(role) ==  users[nextUserId].role) {
            if (uint(role) ==  uint(u.role)) {
                revert UserWithExistingRole("Usuario no puede solicitar el mismo rol");
            }

            if  (u.status == UserStatus.Approved) {
                revert ExistingUserWithApprovedRole("Usuario con rol Aprobado no puede cambiar de rol");
            }

            if  (u.status != UserStatus.Pending) {
                u.status = UserStatus.Pending;
            }
            u.role = role;
            emit UserRoleRequested(msg.sender, role);
        }
            
        else{
            //users[nextUserId] = User(nextUserId, msg.sender, role, UserStatus.Pending); //crea un nuevo User con el ID actual, la dirección que llamó a la función (msg.sender), el rol recibido como parámetro, y un estado definido Pending
            //crea un nuevo User con el ID actual, la dirección que llamó a la función (msg.sender), el rol recibido como parámetro, y un estado definido Pending
            User storage u = users[nextUserId];
            u.id = nextUserId;
            u.userAddress = msg.sender;
            u.role = role;
            u.status = UserStatus.Pending;

            addressToUserId[msg.sender] = nextUserId; //establece la relación entre la dirección y el ID del usuario. 
            // Incrementar el ID para el próximo usuario
            nextUserId++;
            emit UserRoleRequested(msg.sender, role);
        }
    }

    function changeStatusUser(address userAddress, UserStatus newStatus) public onlyOwner {
        if (msg.sender == address(0) || owner == userAddress ) revert InvalidAddress("Direccion invalida para hacer esta solicitud");
       // userId = addressToUserId[userAddress]; 
        User storage u = users[addressToUserId[userAddress]]; //establece la relación entre la dirección y el ID del usuario. 
        u.status = newStatus;
        emit UserStatusChanged(userAddress, newStatus); 
    }

    function getUserInfo(address userAddress) public view returns (User memory) {
        if (msg.sender == address(0) || owner == userAddress ) revert InvalidAddress("Direccion invalida para hacer esta solicitud");
        return users[addressToUserId[userAddress]];
    }

    function isAdmin(address userAddress) public view returns (bool) {
        if (owner == userAddress ) {
            return true;
        }
        else {
            return false;
        }
    }

    // Gestión de Tokens
    function createToken(string memory name, TokenType tokenType, uint totalSupply, string memory features, uint parentId) public onlyTokenCreators {
        Token storage newToken = tokens[nextTokenId];
        newToken.id = nextTokenId;
        newToken.creator = msg.sender;
        newToken.name = name;
        newToken.tokenType = tokenType;
        newToken.totalSupply = totalSupply;
        newToken.features = features;
        newToken.parentId = parentId;
        newToken.dateCreated = block.timestamp;
        newToken.balance[msg.sender] = totalSupply;

        emit TokenCreated(nextTokenId, msg.sender, name, totalSupply);
        nextTokenId++;
        userTokenCount[msg.sender]++;
    }

    function getToken(uint tokenId) public view returns (uint256 id, address creator, string memory name, TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) {
    Token storage t = tokens[tokenId];
    return (t.id, t.creator, t.name, t.tokenType, t.totalSupply, t.features, t.parentId, t.dateCreated);
}

    function getTokenBalance(uint tokenId, address userAddress) public view returns (uint) {
        if (msg.sender == address(0) || owner == userAddress ) revert InvalidAddress("Direccion invalida para hacer esta solicitud");
        return tokens[tokenId].balance[userAddress];
    }
/*
    // Gestión de Transferencias
    function transfer(address to, uint tokenId, uint amount) public { 
        uint transferId = nextTransferId++;
        Transfer storage newTransfer = transfers[transferId];
        newTransfer.id = transferId;
        newTransfer.from = msg.sender;
        newTransfer.to = to;
        newTransfer.tokenId = tokenId;
        newTransfer.amount = amount;
        newTransfer.dateCreated = block.timestamp;
        newTransfer.status = TransferStatus.Pending;

        emit TransferRequested(transferId, msg.sender, to, tokenId, amount);
    }
    function acceptTransfer(uint transferId) public {
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Pending, "Transfer not pending");
        transfer.status = TransferStatus.Accepted;
        emit TransferAccepted(transferId);
    }
    function rejectTransfer(uint transferId) public {
        Transfer storage transfer = transfers[transferId];
        require(transfer.status == TransferStatus.Pending, "Transfer not pending");
        transfer.status = TransferStatus.Rejected;
        emit TransferRejected(transferId);
    }
    function getTransfer(uint transferId) public view returns (Transfer memory) {
        return transfers[transferId];
    }
*/
    // Funciones auxiliares
    function getUserTokens(address userAddress) public view returns (uint[] memory) {
        uint[] memory userTokens = new uint[](userTokenCount[userAddress]);
        uint index = 0;
        for (uint i = 1; i < nextTokenId; i++) {
            if (tokens[i].balance[userAddress] > 0) {
                userTokens[index] = i;
                index++;
            }
        }
        return userTokens;
    }
/*
    function getUserTransfers(address userAddress) public view returns (uint[] memory) {
        uint[] memory userTransfers = new uint[](userTransferCount[userAddress]);
        uint index = 0;
        for (uint i = 1; i < nextTransferId; i++) {
            if (transfers[i].from == userAddress || transfers[i].to == userAddress) {
                userTransfers[index] = i;
                index++;
            }
        }
        return userTransfers;
    }
*/
}