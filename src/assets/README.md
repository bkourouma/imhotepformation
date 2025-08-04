# Assets - IMHOTEP DATA

## Logo

Pour remplacer le logo temporaire par le vrai logo d'IMHOTEP DATA :

1. **Téléchargez le logo** depuis Facebook ou votre source officielle
2. **Placez le fichier** dans ce dossier (`src/assets/`)
3. **Nommez le fichier** `imhotep-logo.png` ou `imhotep-logo.svg`
4. **Mettez à jour le composant Logo** dans `src/components/shared/Logo.jsx`

### Exemple d'utilisation avec une image :

```jsx
// Dans Logo.jsx, remplacez le composant par défaut par :
import logoImage from '../../assets/imhotep-logo.png';

export default function Logo({ variant = 'default', className = '' }) {
  return (
    <div className={`flex items-center gap-x-3 ${className}`}>
      <img 
        src={logoImage} 
        alt="IMHOTEP DATA" 
        className="h-8 w-auto"
      />
      <div className="flex flex-col">
        <span className="text-lg font-bold">IMHOTEP DATA</span>
        <span className="text-xs font-medium">Formations</span>
      </div>
    </div>
  );
}
```

### Formats recommandés :

- **PNG** : Pour les logos avec transparence
- **SVG** : Pour une qualité parfaite à toutes les tailles
- **JPG** : Pour les photos (moins recommandé pour les logos)

### Tailles recommandées :

- **Largeur** : 200-400px minimum
- **Hauteur** : 50-100px minimum
- **Ratio** : Gardez les proportions originales

## Instructions pour récupérer le logo depuis Facebook :

1. Allez sur https://www.facebook.com/ImhotepData
2. Clic droit sur l'image de profil
3. "Enregistrer l'image sous..."
4. Placez le fichier dans ce dossier
5. Suivez les instructions ci-dessus pour l'intégrer
