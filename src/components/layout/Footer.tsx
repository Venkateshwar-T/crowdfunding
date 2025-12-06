import { Flame, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'GitHub', icon: Github, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
];

const footerLinks = {
  'Campaigns': [
    { name: 'Explore', href: '/campaigns' },
    { name: 'Create', href: '/create-campaign' },
    { name: 'How it works', href: '/#how-it-works' },
  ],
  'About': [
    { name: 'About', href: '/flare' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
  ],
  'Resources': [
    { name: 'Help Center', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Docs', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-background/80 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Flame className="h-7 w-7 text-primary" />
              <span className="font-headline text-xl font-bold tracking-tight">CrowdFund</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Decentralized crowdfunding on the Flare Network.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-headline font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CrowdFund. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {socialLinks.map((social) => (
              <Link key={social.name} href={social.href} className="text-muted-foreground hover:text-primary transition-colors">
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
