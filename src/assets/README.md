# Assets - FDFP-CGECI/ ASPCI

Ce dossier contient les ressources statiques de l'application.

## Logo

Pour remplacer le logo temporaire par le vrai logo de FDFP-CGECI/ ASPCI :

1. Remplacez `logo.png` par le logo officiel
2. Assurez-vous que le logo est au format PNG avec un fond transparent
3. Taille recommandée : 32x32 pixels minimum

### Utilisation dans les composants

```jsx
import logoImage from '/src/assets/logo.png'

<img
  src={logoImage}
  alt="FDFP-CGECI/ ASPCI"
  className="h-8 w-8"
/>
<span className="text-lg font-bold">FDFP-CGECI/ ASPCI</span>
```
