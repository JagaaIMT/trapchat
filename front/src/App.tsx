import "./App.css";
import ProduitsFollowers from "./components/ProduitsFollowers";
import Insert from "./components/Insert";
import ProduitFollowersByProduct from "./components/ProduitFollowersByProduct";
import ProduitViral from "./components/ProduitViral";
import { Divider } from "@mui/material";

function App() {
    return (
        <>
            <div className=" py-6">
                <h1 className="text-2xl font-bold text-center">
                    Base de données NoSLQ - Jagaa MICHEL-SAINTE-ROSE et Damien PASCUAL - INFRES 15
                </h1>
            </div>
            <Divider />
            <div>
                <Insert />
            </div>
            <Divider />

            <h1 className="text-3xl font-bold">Les requêtes</h1>
            <div className="mx-4 my-12">
                <em>
                    1. Obtenir la liste et le nombre des produits commandés par les cercles de followers
                    d'un individu (niveau 1, ..., niveau n)  cette requête permet d'observer le rôle
                    d'influenceur d'un individu au sein du réseau social pour le déclenchement d'achats
                </em>
                <ProduitsFollowers />
            </div>
            <Divider />
            <div className="mx-4 my-12">
                <em>
                    2. Même requête mais avec spécification d'un produit particulier  cette requête
                    permet d'observer le rôle d'influenceur d'un individu suite à un « post » mentionnant
                    un article spécifique
                </em>
                <ProduitFollowersByProduct />
            </div>
            <Divider />
            <div className="mx-4 my-12">
                <em>
                    3. Pour une référence de produit donné, obtenir le nombre de personnes l’ayant
                    commandé dans un cercle de followers « orienté » de niveau n (à effectuer sur
                    plusieurs niveaux : 0, 1, 2 ...)  permet de rechercher les produits « viraux », c’est-à-
                    dire ceux qui se vendent le plus au sein de groupes de followers par opposition aux

                    achats isolés pour lesquels le groupe social n’a pas d’impact
                </em>
                <ProduitViral />
            </div>
        </>
    );
}

export default App;