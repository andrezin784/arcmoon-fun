'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { MOON_FACTORY_ABI } from '@/lib/contracts';
import { FACTORY_ADDRESS, EXPLORER_URL } from '@/lib/wagmi';
import { compressImage, saveImage, generateImageId } from '@/lib/image-upload';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Moon, Rocket, Image as ImageIcon, Check, Loader2 } from 'lucide-react';

export default function CreateTokenForm() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image too large! Max 5MB.');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first!');
      return;
    }

    if (!name || !symbol) {
      toast.error('Name and Symbol are required!');
      return;
    }

    setIsCreating(true);

    try {
      let imageURI = '';
      
      // Process Image Upload
      if (imageFile) {
        toast.loading('Processing image...', { id: 'upload' });
        try {
          // Compress and save locally (for MVP)
          const compressed = await compressImage(imageFile);
          const imageId = generateImageId();
          
          saveImage(imageId, compressed);
          imageURI = `local://${imageId}`;
          
          toast.success('Image processed!', { id: 'upload' });
        } catch (error) {
          console.error('Image error:', error);
          toast.error('Failed to process image', { id: 'upload' });
          setIsCreating(false);
          return;
        }
      }

      writeContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: MOON_FACTORY_ABI,
        functionName: 'createToken',
        args: [name, symbol.toUpperCase(), description, imageURI],
      }, {
        onSuccess: (hash) => {
          toast.success(
            <div>
              <Check className="w-4 h-4 inline mr-1" /> Token created!{' '}
              <a
                href={`${EXPLORER_URL}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-yellow-400"
              >
                View on ArcScan
              </a>
            </div>
          );
          // Clear form
          setName('');
          setSymbol('');
          setDescription('');
          setImageFile(null);
          setImagePreview(null);
        },
        onError: (error) => {
          console.error(error);
          toast.error('Error creating token: ' + error.message);
          setIsCreating(false);
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error('Error: ' + error.message);
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="card-moon glow-gold">
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4 inline-block"
          >
            <Moon className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-yellow-400 text-glow">
            Create New Token
          </h2>
          <p className="text-gray-400 mt-2 flex items-center justify-center gap-1">
            Launch your memecoin to the moon! <Rocket className="w-4 h-4 text-yellow-400" />
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Image Upload */}
          <div className="flex justify-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full border-2 border-dashed border-yellow-500/50 
                         flex items-center justify-center cursor-pointer hover:border-yellow-400 
                         transition-all overflow-hidden group bg-black/20"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                  <span className="text-xs text-gray-400">Upload Image</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                            flex items-center justify-center transition-opacity">
                <span className="text-white text-sm font-bold">Change</span>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Moon Dog"
              className="input-moon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Ex: MDOG"
              maxLength={10}
              className="input-moon uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your token..."
              rows={3}
              className="input-moon resize-none"
            />
          </div>

          <motion.button
            type="submit"
            disabled={!isConnected || isPending || isConfirming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300
                       ${isConnected 
                         ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 moon-pulse' 
                         : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          >
            <AnimatePresence mode="wait">
              {isPending || isConfirming ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isPending ? 'Confirm in Wallet...' : 'Creating Token...'}
                </motion.span>
              ) : (
                <motion.span
                  key="create"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  {isConnected ? 'Create Token' : 'Connect Wallet'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>

        {hash && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl"
          >
            <p className="text-green-400 text-sm flex items-center gap-2">
              <Check className="w-4 h-4" /> Transaction sent!{' '}
              <a
                href={`${EXPLORER_URL}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300"
              >
                View on ArcScan →
              </a>
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
