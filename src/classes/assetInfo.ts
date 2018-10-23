/**
 * 画像アセット関連の静的情報
 */
export class AssetInfo {
	/** ゲーム中の数字（白） */
	// tslint:disable-next-line:typedef
	static numWhite = {
		img: "img_stg_num1",
		json: "json_stg_num1",
		numFrames: [
			"num_W_export0001.png",
			"num_W_export0002.png",
			"num_W_export0003.png",
			"num_W_export0004.png",
			"num_W_export0005.png",
			"num_W_export0006.png",
			"num_W_export0007.png",
			"num_W_export0008.png",
			"num_W_export0009.png",
			"num_W_export0010.png"
		],
		frames: {
			cross: "num_W_export0011.png",
			plus: "num_W_export0012.png",
			minus: "num_W_export0013.png"
		},
		fontWidth: 26,
		fontHeight: 30
	};
	/** ゲーム中の数字（赤） */
	// tslint:disable-next-line:typedef
	static numRed = {
		img: "img_stg_num2",
		json: "json_stg_num2",
		numFrames: [
			"num_R_export0001.png",
			"num_R_export0002.png",
			"num_R_export0003.png",
			"num_R_export0004.png",
			"num_R_export0005.png",
			"num_R_export0006.png",
			"num_R_export0007.png",
			"num_R_export0008.png",
			"num_R_export0009.png",
			"num_R_export0010.png"
		],
		frames: {
			cross: "num_R_export0011.png",
			plus: "num_R_export0012.png",
			minus: "num_R_export0013.png"
		},
		fontWidth: 26,
		fontHeight: 30
	};
	/** ゲーム中の数字（青） */
	// tslint:disable-next-line:typedef
	static numBlue = {
		img: "img_stg_num3",
		json: "json_stg_num3",
		numFrames: [
			"num_Bl_export0001.png",
			"num_Bl_export0002.png",
			"num_Bl_export0003.png",
			"num_Bl_export0004.png",
			"num_Bl_export0005.png",
			"num_Bl_export0006.png",
			"num_Bl_export0007.png",
			"num_Bl_export0008.png",
			"num_Bl_export0009.png",
			"num_Bl_export0010.png"
		],
		frames: {
			cross: "num_Bl_export0011.png",
			plus: "num_Bl_export0012.png",
			minus: "num_Bl_export0013.png"
		},
		fontWidth: 26,
		fontHeight: 30
	};
	/** ゲーム中の数字（黄色 コンボ） */
	// tslint:disable-next-line:typedef
	static numCb = {
		img: "img_num_cb",
		json: "json_num_cb",
		numFrames: [
			"num_Cb_export0001.png",
			"num_Cb_export0002.png",
			"num_Cb_export0003.png",
			"num_Cb_export0004.png",
			"num_Cb_export0005.png",
			"num_Cb_export0006.png",
			"num_Cb_export0007.png",
			"num_Cb_export0008.png",
			"num_Cb_export0009.png",
			"num_Cb_export0010.png"
		],
		frames: {
			cross: "num_Cb_export0011.png",
			plus: "num_Cb_export0012.png",
			minus: "num_Cb_export0013.png"
		},
		fontWidth: 30,
		fontHeight: 34
	};
	/** UI */
	// tslint:disable-next-line:typedef
	static ui = {
		img: "img_stg_ui",
		json: "json_stg_ui",
		frames: {
			iconT: "icon_clock_export.png",  // UIアイコン（時計）
			iconPt: "icon_pt.png"  // UIアイコン（pt）
		}
	};
	/** ステージアセット */
	// tslint:disable-next-line:typedef
	static stage = {
		img: "img_stg_building",
		json: "json_stg_building",
		frames: {
			building: "stg_building.png",  // ステージ全体
			buildingSide: "stg_building_side.png",  // 右端のビル
			bg: "stg_bg.png"  // 背景
		}
	};
}
