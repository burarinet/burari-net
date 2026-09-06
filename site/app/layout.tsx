import type { Metadata } from 'next';
import './globals.css';
import { Header, Footer } from '@/components/site-shell';
export const metadata: Metadata = {
 title:{default:'株式会社ぶらりネット｜省エネ・電力コスト削減',template:'%s｜株式会社ぶらりネット'},
 description:'株式会社ぶらりネットは、お客様に省エネ・電力コスト削減などをトータル的にご提案・施工・管理を行い支援していきます。',
 icons:{icon:'/application/files/5914/3800/8031/11.png'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body id="top"><a className="skip-link" href="#main">本文へスキップ</a><Header/>{children}<Footer/></body></html>}
