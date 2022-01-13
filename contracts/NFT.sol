//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import  "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import  "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
   // auto-increment field for each item
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // by convention _ is used to declare variables with the scope, private 

    // address of nft marrket
    address contractAddress;

    // constructor is a function that must run whenever you instantiate the class(contract)
    constructor (address marketplaceAddress) ERC721("Goget Tokens", "GGT") {

        contractAddress = marketplaceAddress;

    }
    function createToken(string memory tokenURI) public returns(uint){
        // set a new token id for the token to be minted
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId); // mint the token
        _setTokenURI(newItemId, tokenURI); // generate the uri
        setApprovalForAll (contractAddress, true); // grant transaction permission to market

        // return the newitemid that is an integer
        return newItemId; 
    }
}
