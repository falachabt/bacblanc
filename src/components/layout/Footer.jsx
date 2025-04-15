// components/layout/Footer.js
export default function Footer() {
    return (
        <footer className="bg-gray-100 py-4">
            <div className="container mx-auto px-4 text-center text-gray-600">
                <p>© {new Date().getFullYear()} EZ Drive. Tous droits réservés.</p>
            </div>
        </footer>
    );
}