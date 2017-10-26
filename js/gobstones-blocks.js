/* global Blockly */

var ControlColor = 60;
var CommandColor = 200;
var ExpressionColor = 180;
var BindingColor = 30;

/**
 * Create the svg representation of a block and render
 * @name {!string} name of the parameter.
 * @this Blockly.Block
 */
Blockly.createBlockSvg = function(workspace, name, f) {
	var newBlock = workspace.newBlock(name);
	//newBlock.setEditable(false);
	f(newBlock);
	newBlock.initSvg();
	newBlock.render();
};

Blockly.Blocks.Program = {
	init: function () {
		this.jsonInit({
			"type": "Program",
			"message0": "%1 %2 %3",
			"args0": [
				{
					"type": "field_label",
					"text": "programa"
				},
				{
					"type": "input_dummy"
				},
				{
					"type": "input_statement",
					"name": "program",
					"check": ["Statement"]
				}
			]
		})
		this.setColour(100);
		this.setDeletable(true);
		this.setEditable(true);
		this.setMovable(true);
	},

	setDisabledAndUpdateTimestamp: function(disabled) {
		this.setDisabled(disabled);
		if (!disabled) this.$timestamp = Date.now();
	},

	mutationToDom: function() {
		var container = document.createElement("mutation");
		container.setAttribute("timestamp", this.$timestamp || Date.now());
		return container;
	},

	domToMutation: function(xmlElement) {
		const timestamp = xmlElement.getAttribute("timestamp");
		this.$timestamp = timestamp || Date.now();
	},

};

Blockly.Blocks.InteractiveProgram = {
	init: function () {
		this.jsonInit({
			"type": "InteractiveProgram",
			"message0": "%1 %2 %3",
			"args0": [
				{
					"type": "field_label",
					"text": "programa interactivo"
				},
				{
					"type": "input_dummy"
				},
				{
					"type": "input_statement",
					"name": "interactiveprogram",
					"check": ["InteractiveBinding"]
				}
			]
		});
		this.setColour(BindingColor);
		this.setDeletable(true);
		this.setEditable(true);
		this.setMovable(true);
	},

	customContextMenu: function(options) {
		options.unshift({ text: `Agregar timeout`, enabled: !this.$timeout, callback: () => {
			let x = '';
			while (isNaN(parseInt(x)))
				x = prompt("Ingrese un número en milisegundos");
			x = parseInt(x);

			this._addTimeout(x);
		}});

		options.unshift({ text: `Agregar inicialización`, enabled: !this.$init, callback: () => {
			this._addInit();
		}});
	},

	setDisabledAndUpdateTimestamp: function(disabled) {
		this.setDisabled(disabled);
		if (!disabled) this.$timestamp = Date.now();
	},

	mutationToDom: function() {
		var container = document.createElement("mutation");
		if (this.$init) container.setAttribute("init", this.$init);
		if (this.$timeout) container.setAttribute("timeout", this.$timeout);
		container.setAttribute("timestamp", this.$timestamp || Date.now());
		return container;
	},

	domToMutation: function(xmlElement) {
		const init = xmlElement.getAttribute("init");
		const timeout = xmlElement.getAttribute("timeout");
		const timestamp = xmlElement.getAttribute("timestamp");

		if (init) this._addInit()
		if (timeout) this._addTimeout(parseInt(timeout));
		this.$timestamp = timestamp || Date.now();
	},

	_addInit() {
		this.$init = true;
		this.appendDummyInput().appendField('Al inicializar:');
		this.appendStatementInput('init').setCheck(["Statement"]);
	},

	_addTimeout(timeout) {
		this.$timeout = timeout;

		this.appendDummyInput().appendField(`Al estar inactivo ${timeout} milisegundos:`);
		this.appendStatementInput('timeout').setCheck(["Statement"]);
	}
};

// -------------------------------------
// Programa interactivo
// -------------------------------------
createInteractiveBinding = (modifiers, keys) => {
	return {
		init: function () {
			this.jsonInit({
				message0: "%1 %2 %3 %4",
				type: "InteractiveBinding",
				previousStatement: "InteractiveBinding",
				nextStatement: "InteractiveBinding",
				args0: [
					{
						"type": "field_label",
						"text": "Vincular"
					},
					{
						type: "field_dropdown",
						name: "InteractiveBindingDropdownKey",
						options: keys.map(value => [value,value]),
					},
					{
						type: "field_dropdown",
						name: "InteractiveBindingDropdownModifier",
						options: modifiers.map(value => [value,value]),
					},
					{
						"type": "field_label",
						"text": "a:"
					},
				],
				colour: BindingColor,
				tooltip: "Escoger una entrada",
			});

			this.appendStatementInput('block').setCheck(["Statement"]);
		}
	}
};

Blockly.Blocks.InteractiveBinding = createInteractiveBinding([
	'(sin modificador)', 'CTRL_ALT_SHIFT', 'ALT_SHIFT', 'CTRL_ALT', 'CTRL_SHIFT', 'CTRL', 'ALT', 'SHIFT'
], [
	'ARROW_LEFT', 'ARROW_RIGHT', 'ARROW_UP', 'ARROW_DOWN',
	'SPACE', 'ENTER', 'TAB', 'BACKSPACE', 'DELETE', 'ESCAPE',
	'PLUS', 'MINUS', 'ASTERISK', 'SLASH', 'EQUALS', 'L_PARENT', 'R_PARENT', 'L_BRACKET', 'R_BRACKET', 'L_ANGLEBR', 'R_ANGLEBR'
]);

// ------------------------------------------------------
// Control de flujo de ejecucion:
// ------------------------------------------------------

Blockly.Blocks.RepeticionSimple = {
	init: function () {
		this.setColour(ControlColor);
		this.appendValueInput('count')
			.appendField('Repetir');
		this.appendStatementInput('block').setCheck(["Statement"]);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setInputsInline(true);
	}
};

Blockly.Blocks.RepeticionCondicional = {
	init: function () {
		this.setColour(ControlColor);
		this.appendValueInput('condicion')
			.setCheck('Bool')
			.appendField('Repetir hasta que');
		this.appendStatementInput('block').setCheck(["Statement"]);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setInputsInline(true);
	}
};

Blockly.Blocks.AlternativaSimple = {
	init: function () {
		this.setColour(ControlColor);
		this.appendValueInput('condicion')
			.appendField('Si');
		this.appendStatementInput('block').setCheck(["Statement"]);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setInputsInline(true);

		// TODO: Terminar issue https://github.com/gobstones/gobstones-web/issues/211
		//this.$elseIfCount = 0;
	},
/*	customContextMenu: function(options) {
		var name = this.getFieldValue('varName');

		options.unshift({ text: `Agregar 'si no'`, enabled: !this.$else, callback: () => {
			this._addElse();
		}});

		options.unshift({ text: `Agregar 'si no, si'`, enabled: true, callback: () => {
			this._addElseIf();
		}});
	},
	mutationToDom: function() {
		var container = document.createElement("mutation");
		if (this.$elseIfCount) container.setAttribute("elseIfCount", this.$elseIfCount);
		if (this.$else) container.setAttribute("else", this.$else);
		return container;
	},

	domToMutation: function(xmlElement) {
		const $elseIfCount = parseInt(xmlElement.getAttribute("elseIfcount"));
		const $else = xmlElement.getAttribute("else");

		if ($else) this._addElse();
		if ($elseIfCount > 0)
			for (var i = 0; i < $elseIfCount; i++)
				this._addElseIf();
	},

	_addElseIf() {
		this.$elseIfCount++;
		this.appendValueInput("condicion" + this.$elseIfCount).appendField("si no, si:");
		this.appendStatementInput('block' + this.$elseIfCount).setCheck(["Statement"]);
	},

	_addElse() {
		this.$else = true;

		this.appendDummyInput().appendField('si no:');
		this.appendStatementInput('elseBlock').setCheck(["Statement"]);
	}*/
};

Blockly.Blocks.AlternativaCompleta = {
	init: function () {
		this.setColour(ControlColor);
		this.appendValueInput('condicion')
			.appendField('Si');
		this.appendStatementInput('block1').setCheck(["Statement"]);
		this.appendDummyInput()
			.appendField('si no:');
		this.appendStatementInput('block2').setCheck(["Statement"]);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setInputsInline(true);
	}
};

// ------------------------------------------------------
// Comandos:
// ------------------------------------------------------

Blockly.Blocks.Poner = {
	init: function () {
		this.jsonInit({
			message0: 'Poner %1',
			type: "Statement",
			previousStatement: "Statement",
			nextStatement: "Statement",
			args0: [
				{
					type: 'input_value',
					name: 'COLOR'
				}
			],
			colour: CommandColor,
			tooltip: 'Poner color en casillero.',
			inputsInline: true
		});
	}
};

Blockly.Blocks.Sacar = {
	init: function () {
		this.jsonInit({
			type: "Statement",
			previousStatement: "Statement",
			nextStatement: "Statement",
			message0: 'Sacar %1',
			args0: [
				{
					type: 'input_value',
					name: 'COLOR'
				}
			],
			colour: CommandColor,
			tooltip: 'Sacar color de casillero.',
			inputsInline: true
		});
	}
};

Blockly.Blocks.Mover = {
	init: function () {
		this.jsonInit({
			type: "Statement",
			previousStatement: "Statement",
			nextStatement: "Statement",
			message0: 'Mover %1',
			args0: [
				{
					type: 'input_value',
					name: 'DIRECCION'
				}
			],
			colour: CommandColor,
			tooltip: 'Mover en una dirección.',
			inputsInline: true
		});
	}
};

Blockly.Blocks.IrAlBorde = {
	init: function () {
		this.jsonInit({
			type: "Statement",
			previousStatement: "Statement",
			nextStatement: "Statement",
			message0: 'Ir al borde %1',
			args0: [
				{
					type: 'input_value',
					name: 'DIRECCION'
				}
			],
			colour: CommandColor,
			tooltip: 'Ir al borde del tablero.',
			inputsInline: true
		});
	}
};

Blockly.Blocks.VaciarTablero = {
	init: function () {
		this.jsonInit({
			type: "Statement",
			previousStatement: "Statement",
			nextStatement: "Statement",
			message0: 'Vaciar tablero',
			colour: CommandColor,
			tooltip: 'Vaciar el tablero.',
			inputsInline: true
		});
	}
};

Blockly.Blocks.BOOM = {
	init: function () {
		this.jsonInit({
			"type": "Statement",
			"previousStatement": "Statement",
			"nextStatement": "Statement",
			"lastDummyAlign0": "RIGHT",
			"message0": "Hacer ¡BOOM! porque:  %1 %2",
			"args0": [
				{
					"type": "input_dummy"
				},
				{
					"type": "field_input",
					"name": "boomDescription",
					"text": "Ingresar motivo..."
				}
			],
			"inputsInline": false,
			"colour": CommandColor,
			"tooltip": "Este comando hace que estalle todo."
		});
	}
};
// ------------------------------------------------------
// Expresiones:
// ------------------------------------------------------
function createLiteralSelectorBlock(type,values){
	return {
		init: function () {
			this.jsonInit({
				type: type,
				message0: "%1",
				args0: [{
					type: "field_dropdown",
					name: type + "Dropdown",
					options: values.map(value => [value,value]),
				}],
				output: type,
				colour: ExpressionColor,
				tooltip: "Escoger " + type,
			});
		}
	};
}

Blockly.Blocks.ColorSelector = createLiteralSelectorBlock('Color',['Rojo','Verde','Negro','Azul']);
Blockly.Blocks.DireccionSelector = createLiteralSelectorBlock('Direccion',['Este','Oeste','Norte','Sur']);
Blockly.Blocks.BoolSelector = createLiteralSelectorBlock('Bool',['True','False']);

function createSingleParameterExpressionBlock(blockText,returnType){
	return {
		init: function () {
			this.jsonInit({
				message0: blockText + ' %1',
				args0: [
					{
						type: 'input_value',
						name: 'VALUE'
					}
				],
				colour: ExpressionColor,
				inputsInline: true,
				output: returnType
			})
		}
	};
}

Blockly.Blocks.hayBolitas = createSingleParameterExpressionBlock('hay bolitas','Bool');
Blockly.Blocks.puedeMover = createSingleParameterExpressionBlock('puede mover','Bool');
Blockly.Blocks.nroBolitas = createSingleParameterExpressionBlock('numero de bolitas','Number');

// ------------------------------------------------------
// Operaciones:
// ------------------------------------------------------

Blockly.Blocks.OperadorDeComparacion = {
	init: function () {
		this.jsonInit({
			message0: '%1 %2 %3 %4',
			args0: [
				{
					type: 'input_value',
					name: 'arg1'
				},
				{
					type: 'field_dropdown',
					name: 'RELATION',
					options: [['==', '=='], ['/=', '/='], ['<=', '<='], ['<', '<'], ['>=', '>='], ['>', '>']]
				},
				{
					type: 'input_dummy'
				},
				{
					type: 'input_value',
					name: 'arg2'
				}
			],
			colour: ExpressionColor,
			inputsInline: false,
			output: 'Bool'
		});
	}
};

Blockly.Blocks.OperadorNumerico = {
	init: function () {
		this.jsonInit({
			message0: '%1 %2 %3 %4',
			args0: [
				{
					type: 'input_value',
					name: 'arg1'
				},
				{
					type: 'field_dropdown',
					name: 'OPERATOR',
					options: [['+', '+'], ['-', '-'], ['*', '*'], ['div', 'div'], ['mod', 'mod'], ['^', '^']]
				},
				{
					type: 'input_dummy'
				},
				{
					type: 'input_value',
					name: 'arg2'
				}
			],
			colour: ExpressionColor,
			inputsInline: false,
			output: 'Number'
		});
	}
};

Blockly.Blocks.OperadorLogico = {
	init: function () {
		this.jsonInit({
			message0: '%1 %2 %3 %4',
			args0: [
				{
					type: 'input_value',
					name: 'arg1'
				},
				{
					type: 'field_dropdown',
					name: 'OPERATOR',
					options: [['y también', '&&'], ['o bien', '||']]
				},
				{
					type: 'input_dummy'
				},
				{
					type: 'input_value',
					name: 'arg2'
				}
			],
			colour: ExpressionColor,
			inputsInline: false,
			output: 'Bool'
		});
	}
};

Blockly.Blocks.Asignacion = {
	init: function () {
		this.jsonInit(
		{
		"type": "asignacion",
		"message0": "%1 %2 := %3 %4",
		"args0": [
			{
			"type": "field_input",
			"name": "varName",
			"text": "nombre de variable"
			},
			{
			"type": "input_dummy"
			},
			{
			"type": "input_dummy"
			},
			{
			"type": "input_value",
			"name": "varValue"
			}
		],
		"inputsInline": true,
		"previousStatement": null,
		"nextStatement": null,
		"colour": 230,
		"tooltip": "",
		"helpUrl": "",
		}
	);
	},
	customContextMenu: function(options) {
		var name = this.getFieldValue('varName');

		options.unshift({ text: `Crear ${name}`, enabled: true, callback: () => {
			this.createVariableBlock(name);
		}});
	},

	createVariableBlock: function(name) {
		return Blockly.createBlockSvg(this.workspace, 'variables_get', function(b) {
			b.setFieldValue(name, 'VAR');
			b.moveBy(10,5);
		});
	}
};


Blockly.Blocks.variables_get = {
	init: function () {
		this.jsonInit(
		{
		"type": "variables_get",
		"message0": "%1",
		"args0": [
			{
			"type": "field_label",
			"name": "VAR",
			"text": "nombre de variable"
			}
		],
		"output": null,
		"colour": 230,
		"tooltip": "",
		"helpUrl": "",
		}
	);
	},
	mutationToDom: function() {
		var container = document.createElement('mutation');
		container.setAttribute('var', this.getFieldValue('VAR'));
		return container;
	},
	domToMutation: function(xmlElement) {
		var var_name = xmlElement.getAttribute('var');
		this.setFieldValue(var_name, 'VAR');
	},
};

Blockly.Blocks.not = createSingleParameterExpressionBlock('not','Bool');
Blockly.Blocks.siguiente = createSingleParameterExpressionBlock('siguiente','*');
Blockly.Blocks.previo = createSingleParameterExpressionBlock('previo','*');
Blockly.Blocks.opuesto = createSingleParameterExpressionBlock('opuesto','*');
