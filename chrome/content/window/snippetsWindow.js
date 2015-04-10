
/* See license.txt for terms of usage */

define([
	"firebugsnippets/lib/dynamicLoader",
	"firebugsnippets/window/store",
	"firebugsnippets/window/options",
	"firebugsnippets/window/exportImport",
	"firebug/lib/lib",
	"firebugsnippets/window/snippetsWindowEdit",
	"firebugsnippets/window/snippetsGroupWindowEdit",
	"firebugsnippets/lib/consoleDebug",
],
function(DynamicLoader, Store, Options, ExportImport, FBL, SnippetsWindowEdit, SnippetsGroupWindowEdit, console)
{
	var CODE_KEYS =
	{
		BACKSPACE:8,
		TAB:9,
		ENTER:13,
		SHIFT:16,
		CTRL:17,
		ALT:18,
		PAUSE_BREAK:19,
		CAPS_LOCK:20,
		ESCAPE:27,
		PAGE_UP:33,
		SPACE:32,
		PAGE_DOWN:34,
		END:35,
		HOME:36,
		ARROW_LEFT:37,
		ARROW_UP:38,
		ARROW_RIGHT:39,
		ARROW_DOWN:40,
		PRINT_SCREEN:44,
		INSERT:45,
		DELETE:46,
		0:48,
		1:49,
		2:50,
		3:51,
		4:52,
		5:53,
		6:54,
		7:55,
		8:56,
		9:57,
		A:65,
		B:66,
		C:67,
		D:68,
		E:69,
		F:70,
		G:71,
		H:72,
		I:73,
		J:74,
		K:75,
		L:76,
		M:77,
		N:78,
		O:79,
		P:80,
		Q:81,
		R:82,
		S:83,
		T:84,
		U:85,
		V:86,
		W:87,
		X:88,
		Y:89,
		Z:90,
		LEFT_KEY:91,
		RIGHT_KEY:92,
		SELECT_KEY:93,
		NUMPAD_0:96,
		NUMPAD_1:97,
		NUMPAD_2:98,
		NUMPAD_3:99,
		NUMPAD_4:100,
		NUMPAD_5:101,
		NUMPAD_6:102,
		NUMPAD_7:103,
		NUMPAD_8:104,
		NUMPAD_9:105,
		MULTIPLY:106,
		ADD:107,
		SUBTRACT:109,
		DECIMAL_POINT:110,
		DIVIDE:111,
		F1:112,
		F2:113,
		F3:114,
		F4:115,
		F5:116,
		F6:117,
		F7:118,
		F8:119,
		F9:120,
		F10:121,
		F11:122,
		F12:123,
		NUM_LOCK:144,
		SCROLL_LOCK:145,
		MY_COMPUTER:182,
		MY_CALCULATOR:183,
		SEMI_COLON:186,
		EQUAL_SIGN:187,
		COMMA:188,
		DASH:189,
		PERIOD:190,
		FORWARD_SLASH:191,
		OPEN_BRACKET:219,
		BACK_SLASH:220,
		CLOSE_BRACKET:221,
		SINGLE_QUOTE:222
	};
	
	var regExpLimpieza = new RegExp("([\\.\\\\\\+\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])", "g");
	var regExpComodin = new RegExp("\\*", "g");
	var idTime = 0;
	var retardo = 150;
	var lastText = "";
	
	var snippetReference;

	var $j;
	var that;
	function SnippetsWindow(win)
	{
		this.window = win;
		this.document = this.window.document;
		that = this;

		this.baseruta = "chrome://firebugsnippets/skin/";
		this.rutaImgClose = this.baseruta+"tree_close.gif";
		this.rutaImgOpen = this.baseruta+"tree_open.gif";

		this.rutaImgEdit = this.baseruta+"edit.png";
		this.rutaImgDelete = this.baseruta+"delete.png";

		var dynamicLoader = new DynamicLoader(
			that.window,
			[
				"chrome://firebugsnippets/content/lib/jquery.min.js",
				"chrome://firebugsnippets/content/lib/jqueryInitializer.js",
				"chrome://firebugsnippets/content/lib/jquery-ui.min.js",
			],
			[],
			function(){
				$j = that.window.initJQuery(that.window);
				var resizeTimer;
				$j(that.window).bind("resize",function(){
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(saveDimWindow, 250);
				});
			});
		dynamicLoader.load();
	}

	function altoWindow(window){
		return window.document.body["clientHeight"] ;
	}

	//Esta función guarda la configuración de cada elemento presentado
	//Por cada uno guardamos su identificador, el orden y el grupo al que pertenece
	//De este modo cuando queramos actualizar los cambios, solo ejecutaremos los updates
	//de aquellos elementos que se han modificado
	function createSnippetReference(){
		snippetReference = {};
		$j("ol.snippets_group").each(function(){
			let group_id = $j(this).attr("group_id");
			$j(this).find(".li_snippetElement").each(function(index){
				let snippet_id = $j(this).attr("snippet_id");
				snippetReference[snippet_id+"-"+index+"-"+group_id]=true;
			});
		});
	}
	
	function saveDimWindow()
	{
		Options.setPref(Options.snippetsWindowWidth, $j(that.window).width());
		Options.setPref(Options.snippetsWindowHeight, altoWindow(that.window));
	};

	function limpiaCadena(str)
	{
		str = str || "";
		str = str.replace(regExpLimpieza, "\\$1");
		str = creaExpresionParaTildes(str.replace(regExpComodin,".*"));
		return str;
	}

	function creaExpresionParaTildes(cadena)
	{
		return cadena.replace(/a/gi,"[aá]").replace(/e/gi,"[eé]").replace(/i/gi,"[ií]").replace(/o/gi,"[oó]").replace(/u/gi,"[uú]");
	}

	function regExpFactory(cadena)
	{
		return new RegExp(limpiaCadena(cadena), "i");
	}
	function markLi(next)
	{
		var posElement = next?1:-1;
		var marcado = $j(".li_snippetElement_marcado");
		var siguiente;
		if(!marcado.length)
		{
			siguiente=$j("li:visible").eq(0);
		}
		else
		{
			var arr = $j("li:visible").toArray();
			var pos = $j.inArray(marcado[0], arr);
			siguiente=$j(arr[pos+posElement]||marcado);
		}
		marcado.removeClass("li_snippetElement_marcado");
		siguiente.addClass("li_snippetElement_marcado");
		siguiente.focus();
		$j('body').scrollTop(siguiente.offset().top-100);
	}
	
	function exeMarkedLi()
	{
		var marcado = $j(".li_snippetElement_marcado");
		marcado.find(".snippetElement").trigger("click");
	}
				
SnippetsWindow.prototype =
{
	onLoad: function()
	{
		var margen = $j("div.margen").empty();
		console._ok("SnippetsWindow onLoad. Elemento de inicio", margen, FBL.$STR("firebugsnippets.snippetsWindow.new_snippet"));

		var margen_interno = $j('<div class="margen_interno">');
		margen.append(margen_interno);//.appendTo(this.document.body);
		this.margen_interno = margen_interno;

		this.initDatabase();
		this.initEvents();
	},
	initDatabase: function()
	{
		//Si la BD ya existe, suponemos que es la correcta y damos por inicializado el sistema
		if(Store.existsDatabase())
		{
			if(Options.isLatestVersion())
			{
				this.updateList();
			}
			else
			{
				Store.updateDatabase(() => {
					this.updateList();
				});
			}
		}
		else
		{
			Store.init(() => {
				Options.run(() => {
					this.updateList();
				});
			});
		}

		Options.updateToLatestVersion();
	},
	initEvents: function(){
		//Funciones de click en los snippets y en los botones
		this.margen_interno.on("click","li .snippetElement", function(e){
			let snippet_id = $j(this).closest("li").attr("snippet_id");
			Store.getById(snippet_id, (snippetConcreto) => {
				console._ok("Store.getById", snippetConcreto);
				that.onInsert(snippetConcreto);
			});
		});
		this.margen_interno.on("click","li .buttons .edit", function(event){
			let li = $j(this).closest("li");
			let snippet_id = li.attr("snippet_id");
			event.stopPropagation();
			li.addClass("edit");
			that.onOpenWindowEdit(snippet_id);
			li.removeClass("edit");
		});
		this.margen_interno.on("click","li .buttons .borrar", function(event){
			let li = $j(this).closest("li");
			let snippet_id = li.attr("snippet_id");
			event.stopPropagation();
			li.addClass("delete");
			if(that.window.confirm(FBL.$STR("firebugsnippets.snippetsWindow.confirm_delete")))
			{
				Store.delete(snippet_id,() => {
					li.fadeOut(li.remove);
				});
			}
			else
			{
				li.removeClass("delete");
			}
		});
		$j("#new_snippet").click(this.new_snippet.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindow.new_snippet"));
		$j("#admin_groups").click(this.admin_groups.bind(this)).html(FBL.$STR("firebugsnippets.snippetsWindow.admin_groups"));

		$j("#filtro").attr("placeholder",FBL.$STR("firebugsnippets.Type_any_key_to_filter_list")).bind('keydown', function(e){			
			if(e.keyCode==CODE_KEYS.ESCAPE)
			{
				$j(this).blur().val("");
				that.updateList();
				e.stopPropagation();
			}			
		});
		$j(this.window).bind('keydown', function(e){
			if(e.keyCode==CODE_KEYS.ESCAPE)
			{
				this.window.close();
			}
			else
			{
				if(e.keyCode == CODE_KEYS.ARROW_DOWN)
				{
					markLi(true);
					e.stopPropagation();
				}
				else if(e.keyCode == CODE_KEYS.ARROW_UP)
				{
					markLi(false);
					e.stopPropagation();
				}
				else if(e.keyCode == CODE_KEYS.ENTER)
				{
					exeMarkedLi();
					e.stopPropagation();
				}
				else
				{
					$j("#filtro").focus();
					clearTimeout(idTime);
					idTime = setTimeout(function(){
						that.filtraSnippets($j("#filtro").val());
					}, retardo);
				}
			}
		});
	},	
	filtraSnippets: function(text)
	{		
		if(lastText == text)
		{
			return;
		}
		else if(!text)
		{
			this.updateList();
		}
		lastText = text;
		
		var expresionBusqueda = regExpFactory(text);

		$j(".snippets_group").show();
		$j(".li_snippetElement").each(function(){
			let li = $j(this);
			var coincide = expresionBusqueda.test(li.text());
			if(!coincide)
			{
				li.hide();
			}
			else
			{
				li.show();
			}
		});
	},
	updateList: function(callback)
	{
		$j(this.margen_interno).empty();

		Store.getAllGroups((groups) => {
			for (var key_group in groups)
			{
				if (groups.hasOwnProperty(key_group))
				{
					let id_group = groups[key_group].id;
					var open_group = !!groups[key_group].open;
					var name_group = groups[key_group].name;

					var fieldset = $j('<fieldset>').appendTo(this.margen_interno);
					var legend = $j('<legend>').appendTo(fieldset).text(name_group).click(function(event){
						var img = $j(this).find("img")[0];
						if(img.src == that.rutaImgClose)
						{
							img.src = that.rutaImgOpen;
							$j("#ol_"+id_group).fadeOut(100);
						}
						else
						{
							img.src = that.rutaImgClose;
							$j("#ol_"+id_group).fadeIn(100);
						}
					});

					var rutaImagen = open_group?that.rutaImgClose:this.rutaImgOpen;
					$j('<img class="imgexpand" />').prependTo(legend).attr("src", rutaImagen);

					var ol = $j('<ol class="snippets_group">').appendTo(fieldset).attr("id", "ol_"+id_group).attr("group_id", id_group);
					if(!open_group)
					{
						ol.hide();
					}

					Store.getAllSnippetInGroup(id_group, (snippets) => {
						for (var key_snippet in snippets)
						{
							if (snippets.hasOwnProperty(key_snippet))
							{
								$j(
								"<li class='li_snippetElement' snippet_id='"+snippets[key_snippet].id+"'>"+
									"<span class='snippetElement'>"+snippets[key_snippet].name+"</span>"+
									"<span class='buttons'>"+
										"<img class='edit' src='"+this.rutaImgEdit+"'>"+
										"<img class='borrar' src='"+this.rutaImgDelete+"'>"+
									"</span>"+
								"</li>"
								).appendTo(ol);
							}
						}
						if (callback)
						{
							callback();
						}
					});

					//Hacemos que los elementos de la lista sean reordenables
					$j('ol.snippets_group').sortable({
						handle : 'span.snippetElement',
						cursor : "grabbing",
						delay:100,
						connectWith: 'ol.snippets_group',
						opacity: 0.5,
						revert: 150,
						placeholder: {
							element: function(clone) {
							   var holder = $j("<li/>").css({
									height: clone.height(),
								}).addClass("placeholder-highlight");
								return holder;
							},
							update: function(ui,clone) {

							}
						},
						stop : function(event, ui)
						{
							that.updateOrdGroup();
						}
					});
					createSnippetReference();
				}
			}
			if (callback)
			{
				callback();
			}
		});
	},
	updateOrdGroup:function(){
		var queries = [];
		$j("ol.snippets_group").each(function(){
			let group_id = $j(this).attr("group_id");
			$j(this).find(".li_snippetElement").each(function(index){
				let snippet_id = $j(this).attr("snippet_id");
				var snippet = {
					id: snippet_id,
					orden: index,
					id_snippets_groups: group_id
				};
				//NOTA: hacemos esta comprobación para no actulizar elementos que no se han modificado,
				//pero después de varias pruebas no se aprecia diferencia de tiempos
				if(!snippetReference[snippet_id+"-"+index+"-"+group_id])
				{
					queries.push(Store.stringStatementForUpdateOrdGroup(snippet));
				}
			});
		});
		setTimeout(function(){
			Store.executeTransaction(queries);
			createSnippetReference();
		}, 0);
	},
	onInsert: function(snippetConcreto)
	{
		this.insertToFirebug(snippetConcreto);

		this.window.close();

		return true;
	},
	insertToFirebug: function(snippetConcreto)
	{
		var text = snippetConcreto.code;
		if (text.length>0)
		{
			AcebugEditor = Firebug.Ace && Firebug.Ace.win2 && Firebug.Ace.win2.editor;
			if(AcebugEditor)
			{
				AcebugEditor.insert(text);
			}
			else
			{
				Firebug.CommandEditor.setText(text);
			}
		}
	},
	onOpenWindowEdit: function(id)
	{
		var conf = {};
		var args = {
			id: id,
			SnippetsWindowEdit: SnippetsWindowEdit,
			conf:conf
		};

		var w = Options.getPref(Options.snippetsWindowEditWidth) || 700;
		var h = Options.getPref(Options.snippetsWindowEditHeight) || 500;

		this.window.openDialog(
			"chrome://firebugsnippets/content/window/snippetsWindowEdit.html",
			"SnippetsWindowEdit",
			"modal,resizable,width="+w+",height="+h,
			args);

		if(conf.save)
		{
			this.updateList();
		}
	},
	new_snippet: function()
	{
		this.onOpenWindowEdit();
	},
	admin_groups: function()
	{
		var conf = {};
		var args = {
			SnippetsGroupWindowEdit: SnippetsGroupWindowEdit,
			conf:conf
		};
		this.window.openDialog(
			"chrome://firebugsnippets/content/window/SnippetsGroupWindowEdit.html",
			"SnippetsGroupWindowEdit",
			"modal", args);

		if(conf.save)
		{
			this.updateList();
		}
	},

};


// ********************************************************************************************** //
// Registration

return SnippetsWindow;

// ********************************************************************************************** //
});
