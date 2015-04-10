function initJQuery(window){
	var jQuery = window.jQuery;
	//Inicializamos JQuery
	jQuery.noConflict(); // keep the real jQuery for now
	var $jContext = function( selector ){
		return new jQuery.fn.init( selector, window.document );
	};
	$jContext.fn = $jContext.prototype = jQuery.fn;
	jQuery.extend($jContext, jQuery ); // copy static method
	// Then override default jQuery
	return $jContext;
}