import "./App.css";
import ProduitsFollowers from "./components/ProduitsFollowers";
import Insert from "./components/Insert";
import ProduitFollowersByProduct from "./components/ProduitFollowersByProduct";
import ProduitViral from "./components/ProduitViral";

function App() {
    const urllist = ["mariadb", "neo4j"];


    return (
        <>
            <div>
                <h1 className="text-3xl font-bold">Insertion</h1>
                {urllist.map((value, key: number) => (
                    <Insert key={key} base={value} />
                ))}
            </div>

            <h1 className="text-3xl font-bold">Requêtes</h1>
            <div>
                <em>
                    1. Obtenir la liste et le nombre des produits commandés par les cercles de followers
                    d'un individu (niveau 1, ..., niveau n)  cette requête permet d'observer le rôle
                    d'influenceur d'un individu au sein du réseau social pour le déclenchement d'achats
                </em>
                {urllist.map((value, key: number) => (
                    <ProduitsFollowers key={key} base={value} />
                ))}
            </div>
            <div>
                <em>
                    2. Même requête mais avec spécification d'un produit particulier  cette requête
                    permet d'observer le rôle d'influenceur d'un individu suite à un « post » mentionnant
                    un article spécifique
                </em>
                {urllist.map((value, key: number) => (
                    <ProduitFollowersByProduct key={key} base={value} />
                ))}
            </div>
            <div>
                <em>
                    3. Pour une référence de produit donné, obtenir le nombre de personnes l’ayant
                    commandé dans un cercle de followers « orienté » de niveau n (à effectuer sur
                    plusieurs niveaux : 0, 1, 2 ...)  permet de rechercher les produits « viraux », c’est-à-
                    dire ceux qui se vendent le plus au sein de groupes de followers par opposition aux

                    achats isolés pour lesquels le groupe social n’a pas d’impact
                </em>
                {urllist.map((value, key: number) => (
                    <ProduitViral key={key} base={value} />
                ))}
            </div>
        </>
    );
}

export default App;