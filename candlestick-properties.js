/**
 * @owner Anurag Prasad
 */

define( [], function ( ) {	

	// Define color to show Increment
	var increaseColor = {
		label:"Bar color (Increase) ",
		ref: "cs.increaseColor",
		type: "string",
		defaultValue: "#ffffff"
	}

	// Define color to show Decrease
	var decreaseColor = {
		label:"Bar color (Decrease) ",
		ref: "cs.decreaseColor",
		type: "string",
		defaultValue: "#333333"
	}

	//Define the Border Color
	var borderColor = {
		type: "string",
		label: "Border color",
		ref: "cs.borderColor",
		defaultValue: "#333"
	}

	//Define the H-L Avg Line Color
	var HLColor = {
		type: "string",
		label: "HL Avg Line Color",
		ref: "cs.HLColor",
		defaultValue: "#bf500b"
	}

	//Define the O-C Avg Line Color
	var OCColor = {
		type: "string",
		label: "OC Avg Line Color",
		ref: "cs.OCColor",
		defaultValue: "#284b91"
	}

	//Define the width of the Stick
	var stickSetting = {
		type: "number",
		component: "slider",
		label: "Stick width (px)",
		ref: "cs.stickWidth",
		min: 1,
		max: 5,
		step: 1,
		defaultValue: 1
	}

	//Define the width of the Line
	var lineSetting = {
		type: "number",
		component: "slider",
		label: "Line width (px)",
		ref: "cs.lineWidth",
		min: 1,
		max: 4,
		step: 1,
		defaultValue: 2
	}

	//Option to hide H-L line
	var hideHLLine ={
		type: "boolean",
		label: "Hide H-L line",
		ref: "cs.hideHLLine",
		defaultValue: false
	}

	//Option to hide OC line
	var hideOCLine ={
		type: "boolean",
		label: "Hide O-C line",
		ref: "cs.hideOCLine",
		defaultValue: false
	}

	var legendSetting = {
		type:"boolean",
		label:"Show legend",
		defaultValue: false,
		ref: "cs.legendSetting",
	}

	var appearanceSection = {
		uses: "settings",
		items: {
			// Definition of the Color header
			colorHeader: {
				type: "items",
				label: "Colors",
				items: {
					increaseColor: increaseColor,
					decreaseColor: decreaseColor,
					borderColor: borderColor,
					HLColor: HLColor,
					OCColor: OCColor
				}
			},

			// Definition of the Presentation header
			presentation: {
				type: "items",
				label: "Presentation",
				items: {
					stickSetting: stickSetting,
					lineSetting: lineSetting,
					hideHLLine: hideHLLine,
					hideOCLine: hideOCLine
				}
			},

			// Definition of the Legend header
			legend: {
				type: "items",
				label: "Legend",
				items: {
					legendSetting: legendSetting
				}
			},
			
		}
	};
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: {
				uses: "dimensions",
				min: 0,
				max: 5
			},
			// measures: {
			// 	uses: "measures",
			// 	min: 0,
			// 	max: 2
			// },
			sorting: {
				uses: "sorting"
			},
			settings: appearanceSection
		}
	};
 
});
