var SCENE_BLUR_MIN = 1.5;
var SCENE_BLUR_MAX = 10;
var FRAME_SIZE_TO_SCENE_SIZE_MIN = 0.03;
var FRAME_SIZE_TO_SCENE_SIZE_MAX = 0.4;
var PHOTO_HEIGHT = 110;

var naturalSceneWidth, naturalSceneHeight;
var sceneScale;
var naturalFrameWidth, naturalFrameHeight;
var actualFrameWidth, actualFrameHeight;
var draggedPhoto$;

/*
	initialization
*/

function handlePhotoCameraScreenWindowLoad() {
	$(window).resize(handleWindowResize);
	$("#scene").load(handleSceneLoad)
		.mousemove(handleSceneMouseMove)
		.mouseout(handleSceneMouseOut)
		.click(handleSceneClick);
	$("#blurInput").bind("input", handleBlurChange);
	$("#frameWidthInput").bind("input", handleFrameWidthChange);
	$("#frameHeightInput").bind("input", handleFrameHeightChange);
	$("#sceneChoiceLinkPara a").bind("click", goToSceneChoiceScreen);
	
	$("#photosArea").append(createPhotoDropZone$());
}

function goToSceneChoiceScreen() {
	$("#sceneChoiceScreen").show();
	$("#photoCameraScreen").hide();
}

function openScene(imageHtmlUri, imageCssUri) {
	$("#scene").attr("src", imageHtmlUri);
	$("#frame").attr("src", imageHtmlUri);
}

function handleSceneLoad() {
	var scene = $("#scene");
	naturalSceneWidth = scene[0].naturalWidth;
	naturalSceneHeight = scene[0].naturalHeight;
	
	handleWindowResize();
	handleBlurChange();
	setFrameWidth();
	setFrameHeight();
}

function handleWindowResize() {
	sceneScale = $("#scene").width() / naturalSceneWidth;
	centerScene();
	setActualFrameWidth();
	setActualFrameHeight();
}

function setFrameWidth() {
	var sizeRatio = $("#frameWidthInput").val() * (FRAME_SIZE_TO_SCENE_SIZE_MAX - FRAME_SIZE_TO_SCENE_SIZE_MIN)
		+ FRAME_SIZE_TO_SCENE_SIZE_MIN;
	naturalFrameWidth = sizeRatio * naturalSceneWidth;
	setActualFrameWidth();
}

function setFrameHeight() {
	var sizeRatio = $("#frameHeightInput").val() * (FRAME_SIZE_TO_SCENE_SIZE_MAX - FRAME_SIZE_TO_SCENE_SIZE_MIN)
		+ FRAME_SIZE_TO_SCENE_SIZE_MIN;
	naturalFrameHeight = sizeRatio * naturalSceneHeight;
	setActualFrameHeight();
}

function setActualFrameWidth() {
	actualFrameWidth = naturalFrameWidth * sceneScale;
}

function setActualFrameHeight() {
	actualFrameHeight = naturalFrameHeight * sceneScale;
}

function centerScene() {
	var area$ = $("#sceneArea");
	var scene$ = $("#scene");
	var frame$ = $("#frame");
	var left = (area$.width() - scene$.width()) / 2 + "px";
	var top = (area$.height() - scene$.height()) / 2 + "px";
	scene$.css("left", left).css("top", top);
	frame$.css("left", left).css("top", top);
}

/*
	scene events
*/

function handleSceneMouseMove(e) {
	var halfWidth = actualFrameWidth / 2;
	var halfHeight = actualFrameHeight / 2;
	var top = e.offsetY - halfHeight + "px";
	var right = e.offsetX + halfWidth + "px";
	var bottom = e.offsetY + halfHeight + "px";
	var left = e.offsetX - halfWidth + "px";
	
	$("#frame").css("clip", "rect(" + top + "," + right + "," + bottom + "," + left + ")");
}

function handleSceneMouseOut(e) {
	$("#frame").css("clip", "rect(0, 0, 0, 0)");
}

function handleSceneClick(e) {
	var halfWidth = actualFrameWidth / 2;
	var halfHeight = actualFrameHeight / 2;
	var top = e.offsetY - halfHeight;
	var left = e.offsetX - halfWidth;
	takePhoto(left, top);
}

function takePhoto(sceneViewLeft, sceneViewTop) {
	var photoToFrameSizeRatio = PHOTO_HEIGHT / actualFrameHeight;
	var photoHeight = PHOTO_HEIGHT;
	var photoWidth = actualFrameWidth * photoToFrameSizeRatio;
	var photo$ = $("<canvas class='photo' width='" + photoWidth + "' height='" + photoHeight + "' draggable='true'></canvas>");
	var canvasContext = photo$[0].getContext("2d");
	canvasContext.drawImage($("#scene")[0], sceneViewLeft / sceneScale, sceneViewTop / sceneScale,
		naturalFrameWidth, naturalFrameHeight, 0, 0, photoWidth, photoHeight);
	photo$.bind("dragstart", handlePhotoDragStart)
		.bind("dragend", handlePhotoDragEnd);
		
	$(".dropZone:last-child").after(photo$);
	var dropZone$ = createPhotoDropZone$();
	$(".photo:last-child").after(dropZone$);
}

function createPhotoDropZone$() {
	var dropZoneBar$ = $("<div class='dropZoneBar'></div>");
	return $("<div class='dropZone'></div>")
		.bind("dragenter", handleDropZoneDragEnter)
		.bind("dragover", handleDropZoneDragOver)
		.bind("dragleave", handleDropZoneDragLeave)
		.bind("drop", handleDropZoneDrop)
		.append(dropZoneBar$);
}

/*
	input events
*/

function handleBlurChange() {
	var blurPxValue = $("#blurInput").val() * (SCENE_BLUR_MAX - SCENE_BLUR_MIN) + SCENE_BLUR_MIN;
	var filterValue = "blur(" + blurPxValue + "px) brightness(0.8)";
	$("#scene").css("filter", filterValue);
	$("#scene").css("-webkit-filter", filterValue);
}

function handleFrameWidthChange() {
	setFrameWidth();
	displayFrameSkeleton();
}

function handleFrameHeightChange() {
	setFrameHeight();
	displayFrameSkeleton();
}

function displayFrameSkeleton() {
	var skeletonDimensions$ = $("#skeletonDimensions");
	skeletonDimensions$.text(Math.round(naturalFrameWidth) + "x" + Math.round(naturalFrameHeight));

	var skeleton$ = $("#frameSkeleton");
	var area$ = $("#sceneArea");
	skeleton$.width(actualFrameWidth).height(actualFrameHeight);
	var left = (area$.width() - skeleton$.width()) / 2 + "px";
	var top = (area$.height() - skeleton$.height()) / 2 + "px";
	skeleton$.css("left", left).css("top", top);
	
	skeleton$.addClass("displayed");
	setTimeout(function() {
		skeleton$.removeClass("displayed");
	}, 1);
}

/*
	photo drag and drop events
*/

function handlePhotoDragStart(e) {
	draggedPhoto$ = $(this);
	$(this).addClass("dragged");
	$(".dropZone").addClass("draggingEnabled");
	
	e.originalEvent.dataTransfer.effectAllowed = "move";
	e.originalEvent.dataTransfer.setData("text/plain", "dummy");
}

function handleDropZoneDragEnter(e) {
	$(this).addClass("draggedOver");
}

function handleDropZoneDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.originalEvent.dataTransfer.dropEffect = "move";
	return false;
}

function handleDropZoneDragLeave(e) {
	$(this).removeClass("draggedOver");
}

function handlePhotoDragEnd(e) {
	draggedPhoto$ = null;
	$(this).removeClass("dragged");
	$(".dropZone").removeClass("draggingEnabled draggedOver");
}

function handleDropZoneDrop(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}
	
	var draggedPhotoDropZone$ = draggedPhoto$.prev();
	var dropZone$ = $(this);
	if (!dropZone$.is(draggedPhoto$.prev()) && ! dropZone$.is(draggedPhoto$.next())) {
		dropZone$.before(draggedPhotoDropZone$);
		dropZone$.before(draggedPhoto$);
	}
	
	return false;
}
