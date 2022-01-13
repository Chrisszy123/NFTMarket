import {ethers} from 'ethers'
import axios from 'axios'
import {useEffect, useState} from  'react'
import Web3Modal from 'web3modal'
import {nftAddress, nftMarketAddress} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import nftMarket from '../artifacts/contracts/NftMarket.sol/NFTMarket.json'

import Image from 'next/image'

import styles from '../styles/Home.module.css'

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not loaded')

  useEffect(() => {
    // every function you need to run when the page loads
    loadNFTs()
  }, [])

  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftMarketAddress, nftMarket.abi, provider); // connect to the contract using ethers


    // return an array of unsold market items
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {

      const tokenUri = await tokenContract.tokenURI(i.tokenId);

      const meta = await axios.get(tokenUri);

      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item

    }));

    setNfts(items)
    setLoadingState('loaded');
  }

  async function buyNft(nft){
    const web3modal = new Web3Modal()
    const connection =  await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection);

    // sign transaction
    const signer = provider.getSigner();

    const contract = ethers.Contract(nftMarketAddress, nftMarket.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

    const transaction = await contract.createMarketSale(nftAddress, nft, tokenId, {value:price});
    await transaction.wait();

    loadNFTs();
  }

  if (loadingState == 'loaded' && !nfts.length) {
    return (
      <h1 className='px-20 py-20 text-3xl'>
        No Items in Market Place
      </h1>
    )
  }
  return (
    <div className='flex justify-center'>
      <div className='px-4' style={{ maxWidth: '1600px'}}>
        <div className='grid grid-cols-1 sm:grid-cols2 lg:grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft,i)=> {
              <div key={i} className='border shadow rounded-xl overflow-hidden'> 
                <Image src={nft.image} alt='nft image' />
                <div className='p-4'>
                  <p style={{ height: '64px'}} className='text-2xl font-semibold'>
                    {nft.name}
                  </p> 
                  <div style={{height: '70px', overflow: 'hidden'}}>
                    <p className='text-gray-400'>{nft.description}</p>  
                   </div>
                  <div className='p-4 bg-black'> 
                    <p className='text-2xl mb-4 font-bold text-white'>{nft.price} ETH </p>
                  </div>
                  <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => buyNft(nft)}> Buy NFT</button>
                </div>
              </div>
            })
          }
        </div>

      </div>
    </div>
  )
}
