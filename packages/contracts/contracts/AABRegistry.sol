// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * AAB Registry
 * 
 * On-chain registry for yield strategies
 * Agents can query strategies without API
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AABRegistry is Ownable, Pausable, ReentrancyGuard {

    // ============ Structs ============
    
    struct Strategy {
        bytes32 id;
        string name;
        address protocol;
        string category; // lending, staking, amm, yield
        uint256 apy; // in basis points (10000 = 100%)
        uint8 riskLevel; // 1-5 (1 = lowest risk)
        bool active;
        bytes data; // additional config as bytes
    }
    
    struct Chain {
        bytes32 id;
        string name;
        bool active;
    }
    
    struct AgentRegistration {
        address agent;
        uint256 registeredAt;
        uint256 callsCount;
        uint256 volumeUSD;
        bool active;
    }

    // ============ State ============
    
    // Strategy storage
    mapping(bytes32 => Strategy) public strategies;
    bytes32[] public strategyIds;
    
    // Chain storage
    mapping(bytes32 => Chain) public chains;
    bytes32[] public chainIds;
    
    // Protocol addresses
    mapping(address => bool) public authorizedProtocols;
    address[] public protocolList;
    
    // Agent registry
    mapping(address => AgentRegistration) public agents;
    address[] public agentList;
    
    // Strategy by chain
    mapping(bytes32 => bytes32[]) public strategiesByChain;
    
    // Strategy by category
    mapping(string => bytes32[]) public strategiesByCategory;
    
    // Events
    event StrategyAdded(bytes32 indexed id, string name, uint256 apy);
    event StrategyUpdated(bytes32 indexed id, uint256 apy);
    event StrategyRemoved(bytes32 indexed id);
    event ChainAdded(bytes32 indexed id, string name);
    event ProtocolAuthorized(address indexed protocol);
    event ProtocolRevoked(address indexed protocol);
    event AgentRegistered(address indexed agent);
    event AgentCall(address indexed agent, bytes32 indexed strategyId);

    // ============ Modifiers ============
    
    modifier onlyAuthorizedProtocol() {
        require(authorizedProtocols[msg.sender], "Not authorized");
        _;
    }

    // ============ Constructor ============
    
    constructor() {
        // Add default chains
        _addChain("ethereum", "Ethereum");
        _addChain("solana", "Solana");
        _addChain("arbitrum", "Arbitrum");
        _addChain("optimism", "Optimism");
        _addChain("base", "Base");
        _addChain("avalanche", "Avalanche");
        _addChain("polygon", "Polygon");
        _addChain("injective", "Injective");
    }

    // ============ Strategy Management ============
    
    function addStrategy(
        bytes32 id,
        string memory name,
        string memory category,
        uint256 apy,
        uint8 riskLevel,
        bytes memory data
    ) external onlyAuthorizedProtocol whenNotPaused {
        require(!strategies[id].active, "Strategy exists");
        
        Strategy memory newStrategy = Strategy({
            id: id,
            name: name,
            protocol: msg.sender,
            category: category,
            apy: apy,
            riskLevel: riskLevel,
            active: true,
            data: data
        });
        
        strategies[id] = newStrategy;
        strategyIds.push(id);
        
        // Add to chain/category indexes
        // Note: chain would be passed in data or derived
        
        emit StrategyAdded(id, name, apy);
    }
    
    function updateStrategyAPY(bytes32 id, uint256 newAPY) external onlyAuthorizedProtocol {
        require(strategies[id].active, "Strategy not found");
        strategies[id].apy = newAPY;
        emit StrategyUpdated(id, newAPY);
    }
    
    function removeStrategy(bytes32 id) external onlyAuthorizedProtocol {
        require(strategies[id].active, "Strategy not found");
        strategies[id].active = false;
        emit StrategyRemoved(id);
    }
    
    function getStrategy(bytes32 id) external view returns (Strategy memory) {
        return strategies[id];
    }
    
    function getAllStrategies() external view returns (Strategy[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < strategyIds.length; i++) {
            if (strategies[strategyIds[i]].active) count++;
        }
        
        Strategy[] memory result = new Strategy[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < strategyIds.length; i++) {
            if (strategies[strategyIds[i]].active) {
                result[idx] = strategies[strategyIds[i]];
                idx++;
            }
        }
        return result;
    }
    
    function getStrategiesByAPY(uint256 minAPY, uint256 maxResults) external view returns (Strategy[] memory) {
        // Sort by APY and return top results
        // Simplified: just iterate
        uint256 count = 0;
        for (uint256 i = 0; i < strategyIds.length; i++) {
            Strategy memory s = strategies[strategyIds[i]];
            if (s.active && s.apy >= minAPY) count++;
        }
        
        uint256 returnCount = count > maxResults ? maxResults : count;
        Strategy[] memory result = new Strategy[](returnCount);
        
        uint256 idx = 0;
        for (uint256 i = 0; i < strategyIds.length && idx < returnCount; i++) {
            Strategy memory s = strategies[strategyIds[i]];
            if (s.active && s.apy >= minAPY) {
                result[idx] = s;
                idx++;
            }
        }
        return result;
    }

    // ============ Chain Management ============
    
    function _addChain(bytes32 id, string memory name) internal {
        chains[id] = Chain({id: id, name: name, active: true});
        chainIds.push(id);
        emit ChainAdded(id, name);
    }
    
    function addChain(bytes32 id, string memory name) external onlyOwner {
        require(!chains[id].active, "Chain exists");
        _addChain(id, name);
    }

    // ============ Protocol Management ============
    
    function authorizeProtocol(address protocol) external onlyOwner {
        require(!authorizedProtocols[protocol], "Already authorized");
        authorizedProtocols[protocol] = true;
        protocolList.push(protocol);
        emit ProtocolAuthorized(protocol);
    }
    
    function revokeProtocol(address protocol) external onlyOwner {
        require(authorizedProtocols[protocol], "Not authorized");
        authorizedProtocols[protocol] = false;
        emit ProtocolRevoked(protocol);
    }

    // ============ Agent Registry ============
    
    function registerAgent() external {
        require(!agents[msg.sender].active, "Already registered");
        agents[msg.sender] = AgentRegistration({
            agent: msg.sender,
            registeredAt: block.timestamp,
            callsCount: 0,
            volumeUSD: 0,
            active: true
        });
        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender);
    }
    
    function recordCall(bytes32 strategyId) external {
        require(agents[msg.sender].active, "Not registered");
        agents[msg.sender].callsCount++;
        emit AgentCall(msg.sender, strategyId);
    }
    
    function recordVolume(uint256 volumeUSD) external {
        require(agents[msg.sender].active, "Not registered");
        agents[msg.sender].volumeUSD += volumeUSD;
    }

    // ============ Pausable ============
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============
    
    function getChainCount() external view returns (uint256) {
        return chainIds.length;
    }
    
    function getStrategyCount() external view returns (uint256) {
        return strategyIds.length;
    }
    
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }
}
