function initCodemirror(window, $j){
	var myCodeMirror = window.CodeMirror.fromTextArea(window.document.getElementById("code"), {
		mode: "javascript",
		tabMode: "indent",
		lineNumbers: true,
		lineWrapping: true,
		styleActiveLine: true,
		matchBrackets: true,
		highlightSelectionMatches: {showToken: true},

		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
	});
	//myCodeMirror.setSize(600, 400);
	myCodeMirror.setSize("100%");

	function resizeCodemirror(){
		var alto = $win.height();
		var ancho = $win.width();
		wrap.height(alto-120);
		wrap.width(ancho-50);
	}
	var wrap = $j(myCodeMirror.getWrapperElement());
	wrap.css("min-width", "600px");
	wrap.css("min-height", "400px");
	var $win = $j(window);
	$win.resize(resizeCodemirror);
	resizeCodemirror();
	return myCodeMirror;
}