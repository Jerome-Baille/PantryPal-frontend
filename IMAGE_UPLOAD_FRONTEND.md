# Frontend Image Upload Implementation

## Overview
The Angular frontend has been updated to support recipe image uploads with real-time preview, validation, and display functionality.

## Changes Made

### 1. **Recipe Form Component** (`recipe-form.component.ts`)

#### New Properties
```typescript
selectedImage: File | null = null;
imagePreview: string | null = null;
```

#### New Methods

**`onImageSelected(event: Event)`**
- Handles file selection from input
- Validates file type (JPEG, PNG, WebP, AVIF only)
- Validates file size (max 10MB)
- Creates preview using FileReader API
- Shows error messages for invalid files

**`removeImage()`**
- Clears selected image and preview
- Marks form as modified

#### Updated Methods

**`handleCreateSubmit()`**
- Now passes `selectedImage` to `recipeService.createRecipe()`

**`handleUpdateSubmit()`**
- Now passes `selectedImage` to `recipeService.updateRecipe()`

**`getInitializerUpdateForm()`**
- Loads existing recipe image as preview when editing

### 2. **Recipe Form Template** (`recipe-form.component.html`)

Added image upload section with:
- Hidden file input with accept attribute for image types
- Preview container showing selected/existing image
- Remove button (X icon) to clear image
- Upload button with photo icon
- Helper text showing format and size limits
- Conditional display based on whether image exists

### 3. **Recipe Form Styles** (`recipe-form.component.scss`)

New CSS classes:
- `.image-upload-section` - Container for upload UI
- `.image-upload-label` - Label styling
- `.image-preview-container` - Preview wrapper with relative positioning
- `.image-preview` - Image styling (responsive, full-width)
- `.remove-image-btn` - Positioned X button overlay
- `.image-upload-actions` - Button and hint container
- `.image-hint` - Subtle text for format/size info

### 4. **Recipe Detail Component** (`recipe-detail.component.html`)

Added image display section:
- Conditional rendering when `recipe.picture` exists
- Positioned after recipe metadata and before content sections
- Uses alt text from recipe title for accessibility

### 5. **Recipe Detail Styles** (`recipe-detail.component.scss`)

New CSS classes:
- `.recipe-image-container` - Wrapper with max-width and shadow
- `.recipe-image` - Responsive image styling with object-fit

### 6. **Recipe Service** (`recipe.service.ts`)

#### Updated Method Signatures

**`createRecipe(book, recipe, ingredients, timers, image?)`**
- Added optional `image?: File` parameter
- Passes image to `createRecipeWithBookId()`

**`createRecipeWithBookId(recipe, bookId, image?)`**
- Changed from JSON to FormData
- Appends all recipe fields to FormData
- Appends image file if provided
- Removes explicit Content-Type header (browser sets it automatically with boundary)

**`updateRecipe(id, recipe, image?)`**
- Added optional `image?: File` parameter
- Changed from JSON to FormData
- Appends recipe fields and image to FormData

### 7. **Translation Files**

Added new translation keys in both `en.json` and `fr.json`:
- `RECIPE_IMAGE` - "Recipe Image" / "Image de la recette"
- `ADD_IMAGE` - "Add Image" / "Ajouter une image"
- `CHANGE_IMAGE` - "Change Image" / "Changer l'image"
- `IMAGE_UPLOAD_HINT` - Format and size information

## User Flow

### Creating a Recipe with Image
1. User navigates to Create Recipe page
2. User clicks "Add Image" button
3. File picker opens (filtered to image types)
4. User selects an image
5. Image preview appears immediately
6. User can remove and re-select if needed
7. On form submit, image uploads with FormData

### Updating a Recipe with New Image
1. User navigates to Update Recipe page
2. Existing image displays in preview (if available)
3. User clicks "Change Image" button
4. User selects new image
5. New preview replaces old image
6. On form submit, new image uploads and old one is deleted by backend

### Viewing a Recipe with Image
1. User navigates to Recipe Detail page
2. Recipe image displays prominently below title/metadata
3. Image is responsive and properly sized

## Validation

### Client-Side Validation
- **File Type**: Only JPEG, JPG, PNG, WebP, AVIF allowed
- **File Size**: Maximum 10MB
- **Error Messages**: User-friendly snackbar notifications

### Server-Side Validation (Backend)
- MIME type checking via multer
- File size limit enforced
- Automatic cleanup on processing errors

## Image Processing Pipeline

1. **Frontend**: User selects file → Validation → Preview generation
2. **FormData**: File appended to multipart/form-data
3. **Backend Multer**: Receives file → Saves to disk with UUID filename
4. **Backend Sharp**: 
   - Converts to WebP (quality 90%)
   - Auto-rotates based on EXIF
   - Generates 300px thumbnail (quality 85%)
5. **Database**: Stores relative paths
6. **Static Serving**: Images served from `/images/recipes/`

## File Paths

### Backend Storage
- Original: `/images/recipes/{uuid}-{timestamp}.webp`
- Thumbnail: `/images/recipes/thumbnails/{uuid}-{timestamp}.webp`

### Database Storage
- Relative paths stored in `picture` and `thumbnail` fields
- Example: `/images/recipes/abc123-1234567890.webp`

### Frontend Display
- Paths used directly in `<img src>` tags
- Browser requests from static file server

## Browser Compatibility

- **File API**: Modern browsers (IE10+)
- **FileReader**: Modern browsers (IE10+)
- **FormData**: Modern browsers (IE10+)
- **WebP Display**: Modern browsers (Edge, Chrome, Firefox, Safari 14+)

## Security Considerations

- Client-side validation for UX only
- Server-side validation is authoritative
- Authentication required for all operations
- File type validated by MIME and extension
- File size limits prevent DoS
- Unique filenames prevent path traversal

## Performance Notes

- Preview generation uses `FileReader.readAsDataURL()` (async)
- Large images don't block UI
- FormData uploaded efficiently
- Backend processing happens after upload
- Thumbnails reduce bandwidth for list views

## Accessibility

- File input has proper label association
- Alt text uses recipe title
- Keyboard navigation supported
- Screen reader friendly

## Testing Checklist

- [ ] Upload image on create (JPEG, PNG, WebP, AVIF)
- [ ] Upload image on update
- [ ] Remove image before submitting
- [ ] Preview displays correctly
- [ ] File type validation works
- [ ] File size validation works (>10MB)
- [ ] Error messages display
- [ ] Image displays on detail page
- [ ] Responsive design on mobile
- [ ] Image loads from existing recipe on edit
- [ ] Old image deleted when updating

## Future Enhancements

- Multiple image uploads (gallery)
- Image cropping/editing
- Drag-and-drop upload
- Progress bar for large files
- Image optimization before upload (client-side)
- Cloudinary or CDN integration
- Lazy loading for list views
