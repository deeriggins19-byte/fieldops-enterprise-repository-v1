import { Manrope, Space_Grotesk } from 'next/font/google';
import './styles.css';

const manrope = Manrope({
	subsets: ['latin'],
	variable: '--font-body'
});

const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	variable: '--font-heading'
});

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang='en'>
			<body className={`${manrope.variable} ${spaceGrotesk.variable}`}>{children}</body>
		</html>
	);
}
