import { useState, useEffect } from 'react';
import { useReadContract } from "thirdweb/react";
import { contract } from '../config/thirdweb.config';
import { themeConfig } from '../config/theme.config';
import { getCachedNFTData, cacheNFTData } from '../utils/nftCache';

const initialCache = getCachedNFTData();

export default function NFTPreview() {
  const [nftImage, setNftImage] = useState(initialCache?.imageUrl || null);
  const [isVideo, setIsVideo] = useState(initialCache?.isVideo || false);
  const [loading, setLoading] = useState(!initialCache);

  const { data: tokenURI } = useReadContract({
    contract,
    method: "function tokenURI(uint256 tokenId) view returns (string)",
    params: [1n],
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (themeConfig.nftImage.url) {
        setNftImage(themeConfig.nftImage.url);
        setIsVideo(themeConfig.nftImage.isVideo);
        cacheNFTData(themeConfig.nftImage.url, themeConfig.nftImage.isVideo);
        setLoading(false);
        return;
      }

      if (!tokenURI) {
        if (!initialCache) setLoading(false);
        return;
      }

      try {
        let metadataUrl = tokenURI;

        if (tokenURI.startsWith('ipfs://')) {
          metadataUrl = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        if (tokenURI.startsWith('data:application/json;base64,')) {
          const base64Data = tokenURI.replace('data:application/json;base64,', '');
          const metadata = JSON.parse(atob(base64Data));
          processMetadata(metadata);
          return;
        }

        if (tokenURI.startsWith('data:application/json,')) {
          const metadata = JSON.parse(decodeURIComponent(tokenURI.replace('data:application/json,', '')));
          processMetadata(metadata);
          return;
        }

        const response = await fetch(metadataUrl);
        const metadata = await response.json();
        processMetadata(metadata);
      } catch (error) {
        console.error('Error fetching NFT metadata:', error);
        setLoading(false);
      }
    };

    const processMetadata = (metadata) => {
      let imageUrl = metadata.image || metadata.image_url || metadata.animation_url;
      if (imageUrl) {
        if (imageUrl.startsWith('ipfs://')) {
          imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        const videoExtensions = ['.mp4', '.webm', '.mov'];
        const isVideoFile = videoExtensions.some(ext => imageUrl.toLowerCase().includes(ext)) || metadata.animation_url;
        setNftImage(imageUrl);
        setIsVideo(isVideoFile);
        cacheNFTData(imageUrl, isVideoFile);
      }
      setLoading(false);
    };

    fetchMetadata();
  }, [tokenURI]);

  if (loading) {
    return (
      <div className="flex justify-center mb-8">
        <div className="w-64 h-64 rounded-xl bg-surface-muted border border-default animate-pulse flex items-center justify-center">
          <span className="text-muted">Loading NFT...</span>
        </div>
      </div>
    );
  }

  if (!nftImage) return null;

  return (
    <div className="flex justify-center mb-8">
      <div className="relative rounded-xl overflow-hidden shadow-lg border border-accent max-w-sm">
        {isVideo ? (
          <video
            src={nftImage}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-h-80 object-contain bg-surface"
          />
        ) : (
          <img
            src={nftImage}
            alt={themeConfig.nftImage.alt || 'NFT Preview'}
            className="w-full h-auto max-h-80 object-contain bg-surface"
          />
        )}
      </div>
    </div>
  );
}
