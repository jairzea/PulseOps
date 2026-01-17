/**
 * Layout - Componente de layout principal con Header
 */
import { Header } from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Header />
            {children}
        </>
    );
};
