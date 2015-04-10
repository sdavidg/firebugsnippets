/* See license.txt for terms of usage */

define([
	"firebugsnippets/lib/consoleDebug",
],

function(console) {

// ********************************************************************************************** //

var NAME = "snippets.sqlite";
var VERSION = 2;

// ********************************************************************************************** //

var Store =
{
	connection:null,
	idSnippetGroupDefault:1,
	nameEmptyGroup:"empty",

	existsDatabase: function(){
		Components.utils.import("resource://gre/modules/FileUtils.jsm");
		var dbFile = FileUtils.getFile("ProfD", [NAME]);
		var alreadyExists = dbFile.exists();
		return alreadyExists;
	},
	getConnection: function()
	{
		if(this.connection == null)
		{
			var file = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			file.append(NAME);
			var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
			this.connection = storageService.openDatabase(file);

			/*
			//Otra forma:
			Components.utils.import("resource://gre/modules/Services.jsm");
			Components.utils.import("resource://gre/modules/FileUtils.jsm");

			var dbFile = FileUtils.getFile("ProfD", [NAME]);
			var alreadyExists = dbFile.exists();
			if (!alreadyExists)
			{
				var dbConnection = Services.storage.openDatabase(dbFile);
				dbConnection.createTable("foo", "id INTEGER PRIMARY KEY");
			}
			*/
		}

		return this.connection;
	},

	init: function(callback)
	{
		try{
			var statement = this.getConnection().createStatement(
			"CREATE TABLE snippets_groups ("+
				"id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,"+
				"name VARCHAR,"+
				"open BOOL DEFAULT false"+
			")");
			this.execute(statement);
		}catch(e){
			console._error(e);
		}

		try{
			statement = this.getConnection().createStatement(
			"CREATE TABLE snippets ("+
				"id INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL,"+
				"id_snippets_groups REFERENCES snippets_groups(id),"+
				"name VARCHAR,"+
				"code VARCHAR,"+
				"timestamp VARCHAR,"+
				"orden INTEGER"+
			")");
			this.execute(statement);
		}catch(e){
			console._error(e);
		}

		try{
			var statement = this.getConnection().createStatement("INSERT INTO snippets_groups (id, name, open) VALUES (:id, :name, :open);");
			this.bind(statement, "id", this.idSnippetGroupDefault);
			this.bind(statement, "name", "Default group");
			this.bind(statement, "open", true);
			this.execute(statement);
		}catch(e){
			console._error(e);
		}

		if(callback){
			callback();
		}
	},
	updateDatabase: function(callback)
	{
		try{
			var statement = this.getConnection().createStatement("ALTER TABLE snippets ADD COLUMN orden INTEGER");
			this.execute(statement);
		}catch(e){
			//Si falla es que la columna ya existe
			//console._error(e);
		}
		if(callback){
			callback();
		}
	},
	/***************************************************************/
	/*********************** CRUD for groups ***********************/
	insertGroup: function(name, open, callback)
	{
		console._info("insertGroup", arguments);
		var statement = this.getConnection().createStatement("INSERT INTO snippets_groups (name, open) VALUES (:name, :open);");
		this.bind(statement, "name", name||this.nameEmptyGroup);
		this.bind(statement, "open", open);
		this.execute(statement);

		if(callback){
			callback();
		}
	},

	updateGroup: function(id_snippets_groups, name, open, callback)
	{
		console._info("updateGroup", arguments);
		var statement = this.getConnection().createStatement(
			"update snippets_groups set "+
			"name = :name ,"+
			"open = :open "+
			"where id = :id_snippets_groups");

		this.bind(statement, "id_snippets_groups", id_snippets_groups-0);
		this.bind(statement, "name", name||this.nameEmptyGroup);
		this.bind(statement, "open", open);
		this.execute(statement);

		if(callback){
			callback();
		}
	},

	deleteGroup: function(id_snippets_groups, callback)
	{
		console._info("deleteGroup", arguments);
		//Movemos los elementos hijos al grupo por defecto
		var connection = this.getConnection();
		var statement = connection.createStatement(
			"update snippets set id_snippets_groups = :idSnippetGroupDefault where id_snippets_groups = :id_snippets_groups;"
		);
		this.bind(statement, "idSnippetGroupDefault", this.idSnippetGroupDefault);
		this.bind(statement, "id_snippets_groups", id_snippets_groups-0);
		this.execute(statement);

		//eliminamos el grupo
		statement = connection.createStatement(
			"delete from snippets_groups where id = :id_snippets_groups;"
		);
		this.bind(statement, "id_snippets_groups", id_snippets_groups-0);
		this.execute(statement);

		if (callback)
		{
			callback(snippetConcreto);
		}
	},

	getAllGroups: function(callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("SELECT * FROM snippets_groups where id = :id ");
		this.bind(statement, "id", this.idSnippetGroupDefault);

		var results = [];
		while (statement.executeStep())
		{
			var grupo = {
				id: this.extract(statement, "id"),
				name: this.extract(statement, "name"),
				open: this.extract(statement, "open")
			};
			results.push(grupo);
		}

		statement = connection.createStatement("SELECT * FROM snippets_groups where id != :id order by name COLLATE NOCASE;");
		this.bind(statement, "id", this.idSnippetGroupDefault);
		while (statement.executeStep())
		{
			var grupo = {
				id: this.extract(statement, "id"),
				name: this.extract(statement, "name"),
				open: this.extract(statement, "open")
			};
			results.push(grupo);
		}

		if (callback)
		{
			callback(results);
		}
	},

	/*********************** end CRUD for groups ***********************/
	/***************************************************************/

	getAllSnippetInGroup: function(id_snippets_groups, callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("SELECT * FROM snippets where id_snippets_groups = :id_snippets_groups order by orden, name;");
		this.bind(statement, "id_snippets_groups", id_snippets_groups);

		var results = [];
		while (statement.executeStep())
		{
			var snippetConcreto = {
				id: this.extract(statement, "id"),
				name: this.extract(statement, "name"),
				code: this.extract(statement, "code"),
				orden: this.extract(statement, "orden"),
				timestamp: this.extract(statement, "timestamp")
			};
			results.push(snippetConcreto);
		}
		if (callback)
		{
			callback(results);
		}
	},

	getById: function(id, callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("SELECT * FROM snippets where id = :id;");
		this.bind(statement, "id", id);
		statement.executeStep();

		var snippetConcreto = {
			id: this.extract(statement, "id"),
			name: this.extract(statement, "name"),
			code: this.extract(statement, "code"),
			orden: this.extract(statement, "orden"),
			id_snippets_groups:this.extract(statement, "id_snippets_groups"),
			timestamp: this.extract(statement, "timestamp")
		};

		if (callback)
		{
			callback(snippetConcreto);
		}
	},

	insert: function(spec, callback)
	{
		console._warn("insert", arguments.callee.caller);
		spec.timestamp = new Date().getTime();
 
		var connection = this.getConnection();
		var statement = connection.createStatement(
			"INSERT INTO snippets (name,code,timestamp, id_snippets_groups, orden) VALUES "+
			"(:name,:code,:timestamp, :id_snippets_groups, (SELECT max(orden)+1 FROM snippets where id_snippets_groups=:id_snippets_groups));");
		this.bind(statement, "name", spec.name);
		this.bind(statement, "code", spec.code);
		this.bind(statement, "timestamp", spec.timestamp);
		this.bind(statement, "id_snippets_groups", spec.id_snippets_groups-0 || this.idSnippetGroupDefault);
		this.execute(statement);

		if(callback)
		{
			callback();
		}
	},

	update: function(spec, callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("UPDATE snippets set name = :name, code = :code, id_snippets_groups = :id_snippets_groups where id = :id");
		this.bind(statement, "name", spec.name);
		this.bind(statement, "code", spec.code);
		this.bind(statement, "id_snippets_groups", spec.id_snippets_groups-0);
		this.bind(statement, "id", spec.id);
		this.execute(statement);

		if(callback)
		{
			this.getById(spec.id, callback);
		}
	},
	updateOrdGroup: function(spec, callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("UPDATE snippets set orden = :orden, id_snippets_groups = :id_snippets_groups where id = :id");
		this.bind(statement, "orden", spec.orden);
		this.bind(statement, "id_snippets_groups", spec.id_snippets_groups-0);
		this.bind(statement, "id", spec.id);
		this.execute(statement);
		if(callback)
		{
			this.getById(spec.id, callback);
		}
	},
	stringStatementForUpdateOrdGroup: function(spec)
	{
		var statement =
		"UPDATE snippets set "+
		"orden = "+spec.orden+", "+
		"id_snippets_groups = "+spec.id_snippets_groups+" "+
		"where id = "+spec.id+";\n";
		return statement;
	},
	delete: function(id, callback)
	{
		var connection = this.getConnection();
		var statement = connection.createStatement("delete FROM snippets where id = :id");
		this.bind(statement, "id", id);
		this.execute(statement);

		if(callback)
		{
			callback();
		}
	},
	executeTransaction: function(queries)
	{
		var connection = this.getConnection();
		try {
			connection.beginTransaction();
			for(var i = 0; i < queries.length; i++)
			{
				var statement = connection.createStatement(queries[i]);
				statement.execute();
			}
			connection.commitTransaction();
		} catch (ex) {
			console._error("ERROR-->>",ex);
			connection.rollbackTransaction();
			throw ex;
		}
	},
	execute: function(statement)
	{
		try {
			//console._info("execute-->>",statement);
			statement.execute();
		} catch (ex) {
			console._error("ERROR-->>",ex);
			var err = this.getConnection().lastError;
			var text = this.getConnection().lastErrorString;
			this.getConnection().close();
			console._error("ERROR-->>",err, err + " " + text);

			throw ex;
		} finally{
			statement.reset();
			statement.finalize();
		}
	},

	//bind is function from stylishStyle.js
	bind: function(statement, name, value) {
		var index;
		try {
			index = statement.getParameterIndex(":" + name);
		} catch (ex) {
			if (ex.name == "NS_ERROR_ILLEGAL_VALUE") {
				index = statement.getParameterIndex(name);
			} else {
				throw ex;
			}
		}
		if (value === undefined)
			throw "Attempted to bind undefined parameter '" + name + "'";
		else if (value === null)
			statement.bindNullParameter(index);
		else {
			switch(typeof value) {
				case "string":
					statement.bindStringParameter(index, value);
					break;
				case "number":
					statement.bindInt32Parameter(index, value);
					break;
				case "boolean":
					statement.bindInt32Parameter(index, value ? 1 : 0);
					break;
				default:
					throw "Unknown value type '" + typeof value + "' for value '" + value + "'";
			}
		}
	},
	//extract is function from stylishStyle.js
	extract: function(statement, name) {
		var index = statement.getColumnIndex(name);
		var type = statement.getTypeOfIndex(index);
		switch (type) {
			case statement.VALUE_TYPE_NULL:
				return null;
			case statement.VALUE_TYPE_INTEGER:
				return statement.getInt32(index);
			case statement.VALUE_TYPE_FLOAT:
				return statement.getDouble(index);
			case statement.VALUE_TYPE_TEXT:
				return statement.getString(index);
			case statement.VALUE_TYPE_BLOB:
				return statement.getBlob(index);
			default:
				throw "Unrecognized column type " + type;
		}
	},
};

// ********************************************************************************************** //
// Registration

return Store;

// ********************************************************************************************** //
});

