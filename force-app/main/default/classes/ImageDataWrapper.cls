public with sharing class ImageDataWrapper {
    public String imageDocumentId;
    public String imageUrl;
    
    public ImageDataWrapper(String imageDocumentId, String imageUrl) {
        this.imageDocumentId = imageDocumentId;
        this.imageUrl = imageUrl;
    }
}