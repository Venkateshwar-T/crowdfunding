// Using Lucide-React icons for simplicity, can be replaced with custom SVGs
import { Bitcoin, Waves, Doge, Litecoin } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

export const BtcIcon = (props: LucideProps) => <Bitcoin {...props} />;
export const XrpIcon = (props: LucideProps) => <Waves {...props} />;
export const DogeIcon = (props: LucideProps) => <Doge {...props} />;
export const LtcIcon = (props: LucideProps) => <Litecoin {...props} />;
