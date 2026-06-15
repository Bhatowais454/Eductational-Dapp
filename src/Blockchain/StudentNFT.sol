// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StudentNFT is ERC721Enumerable, Ownable {
    uint256 private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("StudentNFT", "SNFT") Ownable(msg.sender) {}

    function mintNFT(address recipient, string memory tokenURI_)
        external
        onlyOwner
        returns (uint256)
    {
        _tokenIds += 1;
        uint256 newItemId = _tokenIds;
        _safeMint(recipient, newItemId);
        _tokenURIs[newItemId] = tokenURI_;
        return newItemId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721)
        returns (string memory)
    {
        address owner = ownerOf(tokenId); // reverts if token does not exist
        return _tokenURIs[tokenId];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}