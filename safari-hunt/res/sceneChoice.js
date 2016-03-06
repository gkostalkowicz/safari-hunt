var imageHtmlUri, imageCssUri;

function handleSceneChoiceScreenWindowLoad() {
	$("#imageInput").change(handleImageInputChange);
	$("#scenePreviewArea").click(goToPhotoCameraScreen);
	$("#galleryPhotos a").click(handleGalleryPhotoLinkClick);
}

function handleImageInputChange(e) {
    if (this.files && this.files[0]) {
        loadImageForPreviewFromFile(this.files[0]);
		showScenePreview();
    }
}

function handleGalleryPhotoLinkClick(e) {
	var imageSource = $(this).children("img").attr("src");
	loadImageFromUri(imageSource, "../" + imageSource);
	goToPhotoCameraScreen();
	$("#scenePreviewArea").hide();
}

function loadImageForPreviewFromFile(file) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var dataUri = e.target.result;
		loadImageFromUri(dataUri, dataUri);
		showScenePreview();
	}
	reader.readAsDataURL(file);
}

function loadImageFromUri(htmlUri, cssUri) {
	imageHtmlUri = htmlUri;
	imageCssUri = cssUri;
}

function showScenePreview() {
	$("#scenePreview").attr("src", imageHtmlUri);
	$("#scenePreviewArea").show();
}

function goToPhotoCameraScreen() {
	$("#sceneChoiceScreen").hide();
	$("#photoCameraScreen").show();
	openScene(imageHtmlUri, imageCssUri);
}
