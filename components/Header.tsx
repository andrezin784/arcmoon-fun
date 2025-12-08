'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import WalletConnect from './WalletConnect';

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full px-4 py-4 glass border-b border-yellow-500/20"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="ARCMOON.FUN Logo"
              width={60}
              height={60}
              className="drop-shadow-lg"
            />
          </motion.div>
          <div className="flex flex-col">
            <motion.span
              className="text-2xl font-bold text-yellow-400 text-glow"
              whileHover={{ scale: 1.05 }}
            >
              ARCMOON.FUN
            </motion.span>
            <span className="text-xs text-gray-400">
              Memecoin Launcher
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
          >
            Create Token
          </Link>
          <a
            href="https://testnet.arcscan.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-yellow-400 transition-colors font-medium"
          >
            ArcScan ↗
          </a>
          <a
            href="https://github.com/andrezin784/arcmoon-fun"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors font-medium"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
          <a
            href="https://x.com/moon_fun1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition-colors font-medium"
          >
            <Twitter className="w-5 h-5" />
            X
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <WalletConnect />
        </div>
      </div>
    </motion.header>
  );
}

