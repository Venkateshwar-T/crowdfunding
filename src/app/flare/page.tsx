import { GlassContainer } from "@/components/shared/GlassContainer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Cpu, Droplets, Fingerprint, Users } from "lucide-react";
import Image from "next/image";

const flareFeatures = [
    {
        id: "flare-fassets",
        icon: <Droplets className="h-10 w-10 text-primary" />,
        title: "FAssets",
        description: "FAssets bring non-smart contract assets like BTC, XRP, and DOGE to the Flare Network. This allows them to be used with smart contracts, enabling decentralized applications like Flarestarter to accept a wider range of funding sources without compromising security or decentralization. It's like wrapping a gift to use it in a new way.",
    },
    {
        id: "flare-fdc",
        icon: <Fingerprint className="h-10 w-10 text-primary" />,
        title: "Flare Decentralized Identity (FDC)",
        description: "FDC provides a framework for verifiable, on-chain identity. For platforms like Flarestarter, this means creators can prove their identity without revealing sensitive personal information, and backers can trust that campaigns are run by verified individuals. It's a digital passport for the Web3 world, enhancing trust and security.",
    },
    {
        id: "flare-ftso",
        icon: <Cpu className="h-10 w-10 text-primary" />,
        title: "Flare Time Series Oracle (FTSO)",
        description: "The FTSO is a highly decentralized oracle that provides reliable, real-time price data to the Flare Network. It's crucial for Flarestarter to accurately calculate funding goals and contribution values across different assets. By sourcing data from a wide range of providers, the FTSO resists manipulation and ensures fair market prices.",
    },
    {
        id: "flare-smart-accounts",
        icon: <Users className="h-10 w-10 text-primary" />,
        title: "Flare Smart Accounts",
        description: "Flare enhances standard Externally Owned Accounts (EOAs) with smart contract capabilities. Each campaign on Flarestarter can be managed by a dedicated smart account, allowing for automated, rule-based fund distribution, milestone-based payments, and decentralized governance. It makes every account smarter and more powerful.",
    }
];


export default function FlarePage() {
  return (
    <div className="container mx-auto px-4 py-12">
       <div className="text-center mb-16">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">The Power of Flare</h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
          Flarestarter is built on a stack of powerful, decentralized technologies provided by the Flare Network.
        </p>
      </div>

      <div className="space-y-16">
        {flareFeatures.map((feature, index) => {
            const image = PlaceHolderImages.find(img => img.id === feature.id);
            const isReversed = index % 2 !== 0;
            return (
                <GlassContainer key={feature.id} className="overflow-hidden">
                    <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center`}>
                        <div className="w-full md:w-1/2">
                            {image && (
                                <Image
                                    src={image.imageUrl}
                                    alt={feature.title}
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-full"
                                    data-ai-hint={image.imageHint}
                                />
                            )}
                        </div>
                        <div className="w-full md:w-1/2 p-8 lg:p-12">
                            <div className="mb-4">{feature.icon}</div>
                            <h2 className="font-headline text-3xl font-bold mb-4">{feature.title}</h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                        </div>
                    </div>
                </GlassContainer>
            )
        })}
      </div>
    </div>
  )
}
