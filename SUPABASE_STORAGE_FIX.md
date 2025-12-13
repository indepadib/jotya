# Configuration Supabase Storage pour Jotya

## Problème Actuel
Les images ne s'affichent pas car le bucket Supabase Storage n'est pas configuré correctement.

## Solution: Configurer le Bucket Public

### Étape 1: Accéder à Supabase Dashboard
1. Aller sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Storage** (dans le menu gauche)

### Étape 2: Configurer le Bucket `jotya-images`

#### Option A: Rendre le Bucket Public (RECOMMANDÉ)
1. Cliquer sur le bucket `jotya-images`
2. Cliquer sur **Settings** (icône engrenage)
3. Activer l'option **Public bucket**
4. Sauvegarder

#### Option B: Créer des Politiques RLS
Si vous voulez plus de contrôle, créez ces politiques:

```sql
-- Policy pour permettre la lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'jotya-images' );

-- Policy pour permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'jotya-images'
  AND auth.role() = 'authenticated'
);

-- Policy pour permettre la suppression aux propriétaires
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'jotya-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Étape 3: Vérifier la Configuration

#### Test URL
Format de l'URL publique:
```
https://vftluxsmspkeymtcwbfa.supabase.co/storage/v1/object/public/jotya-images/FILENAME.jpg
```

#### Essayer dans le navigateur
1. Uploader une image via le form
2. Copier l'URL depuis la base de données
3. Ouvrir dans un nouvel onglet
4. Si l'image s'affiche → ✅ Configuration correcte!

---

## Alternative: Utiliser uniquement Base64

Si Supabase Storage pose problème, le code a déjà un fallback Base64:

### Avantages Base64:
- ✅ Pas de configuration externe
- ✅ Images toujours disponibles
- ✅ Fonctionne immédiatement

### Inconvénients Base64:
- ❌ Base de données plus volumineuse
- ❌ Transferts plus lents
- ❌ Pas de CDN/optimisation

### Forcer Base64 (temporaire)
Modifier `src/components/Sell/ImageUploader.tsx` ligne 47-61:
```typescript
// Commenter l'upload Supabase
// const { error: uploadError } = await supabase.storage...

// Forcer Base64
const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(compressedFile);
});
newUrls.push(base64);
```

---

## Checklist de Dépannage

- [ ] Le bucket `jotya-images` existe dans Supabase Storage
- [ ] Le bucket est configuré comme **Public**
- [ ] Les variables d'environnement sont correctes:
  - `NEXT_PUBLIC_SUPABASE_URL`  
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Tester une URL d'image dans le navigateur
- [ ] Vérifier la console du navigateur pour les erreurs CORS
- [ ] Si tout échoue: activer le fallback Base64

---

## URLs et Credentials

**Supabase URL**: `https://vftluxsmspkeymtcwbfa.supabase.co`

**Dashboard**: [https://supabase.com/dashboard/project/vftluxsmspkeymtcwbfa](https://supabase.com/dashboard/project/vftluxsmspkeymtcwbfa)

**Storage**: [https://supabase.com/dashboard/project/vftluxsmspkeymtcwbfa/storage/buckets](https://supabase.com/dashboard/project/vftluxsmspkeymtcwbfa/storage/buckets)

---

## Contact Support

Si le problème persiste:
1. Vérifier que le bucket existe
2. Essayer de créer un nouveau bucket `jotya-images-v2`
3. Mettre à jour le code pour utiliser le nouveau bucket
4. Contacter le support Supabase si nécessaire
