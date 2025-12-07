'use client';

import Link from 'next/link';
import { ArrowRight, Cpu, Droplets, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { GlassContainer } from '@/components/shared/GlassContainer';

const featureCards = [
  {
    icon: <Droplets className="h-8 w-8 text-primary" />,
    title: 'FAssets',
    description: 'Use non-smart contract assets like BTC, XRP, and DOGE in your campaigns, powered by Flare.',
  },
  {
    icon: <Fingerprint className="h-8 w-8 text-primary" />,
    title: 'Flare DID (FDC)',
    description: 'Build trust with verifiable on-chain identity, ensuring transparency and security for backers.',
  },
  {
    icon: <Cpu className="h-8 w-8 text-primary" />,
    title: 'FTSO',
    description: 'Access reliable, real-time price data for all assets, ensuring fair and accurate funding calculations.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');
  
  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[80vh] text-white">
        {heroImage && (
           <Image
             src={heroImage.imageUrl}
             alt={heroImage.description}
             fill
             className="object-cover"
             priority
             data-ai-hint={heroImage.imageHint}
           />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
            Decentralized Crowdfunding, <br /> Powered by Flare.
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-primary-foreground/80">
            Launch your innovative projects using FAssets like BTC & XRP, secured by the Flare Time Series Oracle.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="font-semibold text-lg py-7 px-8">
              <Link href="/create-campaign">
                Create a Campaign <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="font-semibold text-lg py-7 px-8">
              <Link href="/campaigns">Explore Campaigns</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">How CrowdFund Works</h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              We leverage the full power of the Flare Network to provide a secure, transparent, and versatile crowdfunding experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feature) => (
              <GlassContainer key={feature.title}>
                <div className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="font-headline text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </GlassContainer>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
