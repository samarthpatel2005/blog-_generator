import { motion } from 'framer-motion';
import { Check, Copy, Facebook, Linkedin, Share2, Twitter } from 'lucide-react';
import { useState } from 'react';

const ShareButtons = ({ blog, className = '' }) => {
  const [copied, setCopied] = useState(false);
  
  if (!blog) return null;

  const shareUrl = window.location.href;
  const shareText = `Check out this blog: ${blog.title}`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link');
    }
  };

  const handleShare = (platform) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-gray-600 text-sm font-medium flex items-center">
        <Share2 size={16} className="mr-2" />
        Share:
      </span>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleShare('twitter')}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        title="Share on Twitter"
      >
        <Twitter size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleShare('facebook')}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        title="Share on Facebook"
      >
        <Facebook size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleShare('linkedin')}
        className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin size={16} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={copyToClipboard}
        className={`p-2 rounded-full transition-colors ${
          copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title="Copy link"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </motion.button>
    </div>
  );
};

export default ShareButtons;
