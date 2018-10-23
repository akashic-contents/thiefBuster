import { AsaInfo } from "./asaInfo";
/**
 * ゲーム関連の静的情報
 */
export namespace define {
	/** 制限時間[秒] */
	export const GAME_TIME = 60;
	/** このゲームが許容する最長の制限時間[秒] */
	export const GAME_TIME_MAX = 99;
	/** 残り時間警告が始まる残り時間[秒]（この時間未満になった時に始まる） */
	export const CAUTION_TIME_CONDITION = 6;
	/** 横解像度を480から640に変更した際のX座標オフセット値 */
	export const OFFSET_X = (640 - 480) / 2;
	/** タイマー数字の桁数 */
	export const GAME_TIMER_DIGIT = 2;
	/** タイマー数字のX座標 */
	export const GAME_TIMER_X = 62 + define.OFFSET_X;
	/** タイマー数字のY座標 */
	export const GAME_TIMER_Y = 5;
	/** UIアイコン（時計）のX座標 */
	export const ICON_T_X = 1 + define.OFFSET_X;
	/** UIアイコン（時計）のY座標 */
	export const ICON_T_Y = 1;

	/** ポイント用の数字の桁数 */
	export const GAME_SCORE_DIGIT = 5;
	/** ポイント用の数字のX座標 */
	export const GAME_SCORE_X = 426 + define.OFFSET_X;
	/** ポイント用の数字のY座標 */
	export const GAME_SCORE_Y = 5;
	/** UIアイコン（pt）のX座標 */
	export const ICON_PT_X = 451 + define.OFFSET_X;
	/** UIアイコン（pt）のY座標 */
	export const ICON_PT_Y = 5;

	/** ステージ背景配置位置 */
	export const POS_STAGE_BG: g.CommonOffset = { x: -6, y: -6 };
	/** ステージ配置位置 */
	export const POS_STAGE: g.CommonOffset = { x: 66 + define.OFFSET_X, y: 14 };
	/** ステージ右端ビル配置位置 */
	export const POS_STAGE_SIDE: g.CommonOffset = { x: 555, y: -30 };
	/** 最上段ドア左上 */
	export const POS_DOOR: g.CommonOffset = { x: 120 + define.OFFSET_X, y: 77 };
	/** ドア幅 */
	export const DOOR_WIDTH: number = 54;
	/** 各階高さ */
	export const FLOOR_HEIGHT: number = 100;
	/** 攻撃中停止フレーム長～リロードタイム */
	export const ATTCK_STOP_TIME: number = 10;
	/** ワークマンアタッチポイント名ゴンドラ */
	export const WKMAN_ATTACH_POINT_GONDOLA: string = "gondola";
	/** ワークマンアタッチポイント名攻撃位置 */
	export const WKMAN_ATTACH_POINT_ATTACK: string = "attack_pivot";
	/** ワークマンアタッチ時の相対座標補正値 通常腕位置 */
	export const WKMAN_ATTACH_POS_NORMAL: g.CommonOffset = { x: 38, y: 43 };
	/** ワークマンアタッチ時の相対座標補正値 攻撃腕位置 */
	export const WKMAN_ATTACH_POS_ATTACK: g.CommonOffset = { x: 40, y: 45 };
	/** 弾レベル */
	export enum BulletLevel {
		/** 釘 */
		nail = 1,
		/** ドライバー */
		screwDriver = 2,
		/** スパナ */
		spanner = 3,
		/** ハンマー */
		hammer = 4
	}
	/** 弾速 */
	export const BULLET_MOVE_X: number = 15;
	/** 1投でのMAXコンボ */
	export const MAX_COMBO: number = 4;
	/** アイテム消失までのフレーム */
	export const ITEM_VANISH_LENGTH: number = 20;
	/** アイテム出現までの間隔（秒） */
	export const ITEM_POP_INTERVAL: number = 14;
	// export const ITEM_POP_INTERVAL: number = 1; // debug
	/** アイテム出現位置X 最小 */
	export const POS_ITEM_POP_X_MIN: number = 150 + define.OFFSET_X;
	/** アイテム出現位置X 最大 */
	export const POS_ITEM_POP_X_MAX: number = 430 + define.OFFSET_X;
	/** アイテム出現位置Yリスト */
	export const POS_ITEM_POP_LIST_Y: number[] = [
		134,
		234,
		334
	];

	// 泥棒
	/** 泥棒種類 */
	export enum ThiefType {
		/** チビ */
		short,
		/** ノッポ */
		tall,
		/** デブ */
		grande
	}
	let cnt: number = 0;
	for (let key in ThiefType) { // enum数える
		if (isNaN(parseInt(key, 10))) {
			++cnt;
		}
	}
	/** 泥棒種類 */
	export const NUM_OF_THIEF_TYPE: number = cnt;
	/** ドア前での立ち止まりフレーム */
	export const STOP_DOOR_TIME: number = 6;
	/** 泥棒出現位置Yリスト */
	export const POS_THIEF_POP_LIST_Y: number[] = [
		160,
		260,
		360
	];
	/** 泥棒アニメ種類 */
	export interface ThiefAnimeType {
		/** 歩き */
		walk1: string;
		/** 歩き（デブ用） */
		walk2: string;
		/** ダウン */
		down1: string;
		/** ダウン（デブ用） */
		down2: string;
		/** ドアin */
		in: string;
	}
	/** 泥棒種類ごとの初期値用 */
	export interface ThiefValue {
		/** 泥棒タイプ */
		type: ThiefType;
		/** ライフ */
		life: number;
		/** 移動スピード */
		movSpd: number;
		/** 幅 */
		w: number;
		/** 高さ */
		h: number;
		/** アニメ */
		anim: ThiefAnimeType;
	}
	/** 泥棒アニメ短縮 */
	const animes = AsaInfo.thief.anim;
	/** チビ初期値 */
	export const SHORT_VALUE: ThiefValue = {
		type: ThiefType.short,
		life: 1,
		movSpd: -3,
		w: 60,
		h: 60,
		anim: {
			walk1: animes.shortWalk1,
			walk2: animes.shortWalk1,
			down1: animes.shortDown1,
			down2: animes.shortDown1,
			in: animes.shortIn1
		}
	};
	/** ノッポ初期値 */
	export const TALL_VALUE: ThiefValue = {
		type: ThiefType.tall,
		life: 1,
		movSpd: -4.5,
		w: 72,
		h: 90,
		anim: {
			walk1: animes.tallWalk1,
			walk2: animes.tallWalk1,
			down1: animes.tallDown1,
			down2: animes.tallDown1,
			in: animes.tallIn1
		}
	};
	/** デブ初期値 */
	export const GRANDE_VALUE: ThiefValue = {
		type: ThiefType.grande,
		life: 2,
		movSpd: -2.5,
		w: 118,
		h: 80,
		anim: {
			walk1: animes.grandeWalk1,
			walk2: animes.grandeWalk2,
			down1: animes.grandeDown1,
			down2: animes.grandeDown2,
			in: animes.grandeIn1
		}
	};
	/** 初期値配列 */
	export const THIEF_VALUES: ThiefValue[] = [
		SHORT_VALUE,
		TALL_VALUE,
		GRANDE_VALUE
	];
	/** 泥棒出現フロア定義型 */
	export interface PopFloorInterface {
		/** 泥棒タイプ */
		type: ThiefType;
		/** 出現する階層 */
		value: number[];
	}
	/** 泥棒出現パターン定義型 */
	export interface ThiefPopInterface {
		/** 出現フェーズ */
		phase: number;
		/** このフェーズでの出現間隔 */
		popInterval: number;
		/** 泥棒出現フロア情報 */
		floor: PopFloorInterface[];
		/** 出現泥棒リスト */
		list: ThiefType[];
	}

	/** 泥棒出現レート */
	export const THIEF_POP_RATES: ThiefPopInterface[] = [
		{
			phase: 1,
			popInterval: 45,
			floor: [
				{ type: ThiefType.short, value: [0, 1, 2] },
				{ type: ThiefType.tall, value: [0, 1, 2] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.short
			]
		},
		{
			phase: 2,
			popInterval: 45,
			floor: [
				{ type: ThiefType.short, value: [0, 1, 2] },
				{ type: ThiefType.tall, value: [0, 1, 2] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall
			]
		},
		{
			phase: 3,
			popInterval: 45,
			floor: [
				{ type: ThiefType.short, value: [0, 1, 2] },
				{ type: ThiefType.tall, value: [0, 1, 2] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 4,
			popInterval: 30,
			floor: [
				{ type: ThiefType.short, value: [1, 2] },
				{ type: ThiefType.tall, value: [0, 1] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande
			]
		},
		{
			phase: 5,
			popInterval: 22,
			floor: [
				{ type: ThiefType.short, value: [1, 2] },
				{ type: ThiefType.tall, value: [0, 1] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 6,
			popInterval: 22,
			floor: [
				{ type: ThiefType.short, value: [1, 2] },
				{ type: ThiefType.tall, value: [0, 2] },
				{ type: ThiefType.grande, value: [0, 1, 2] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 7,
			popInterval: 15,
			floor: [
				{ type: ThiefType.short, value: [2] },
				{ type: ThiefType.tall, value: [0] },
				{ type: ThiefType.grande, value: [1] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 8,
			popInterval: 15,
			floor: [
				{ type: ThiefType.short, value: [1, 2] },
				{ type: ThiefType.tall, value: [1] },
				{ type: ThiefType.grande, value: [0] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 9,
			popInterval: 15,
			floor: [
				{ type: ThiefType.short, value: [2] },
				{ type: ThiefType.tall, value: [0] },
				{ type: ThiefType.grande, value: [1] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande
			]
		},
		{
			phase: 10,
			popInterval: 13,
			floor: [
				{ type: ThiefType.short, value: [1] },
				{ type: ThiefType.tall, value: [0, 2] },
				{ type: ThiefType.grande, value: [0, 2] }
			],
			list: [
				ThiefType.short,
				ThiefType.short,
				ThiefType.short,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.tall,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande,
				ThiefType.grande
			]
		}
	];

	/** 基本スコア */
	export const SCORE_BASE: number = 100;
	/** マイナススコア */
	export const SCORE_MINUS: number = -50;
	/** スコア上限 */
	export const SCORE_LIMIT: number = Math.pow(10, GAME_SCORE_DIGIT) - 1;

	/** コンボ表示位置 */
	export const POS_COMBO: g.CommonOffset = { x: 182 + define.OFFSET_X, y: 20 };
	/** ポイント表示位置 Y座標補正01 */
	export const POS_POINT_OFFSET_Y_1: number = -34;
	/** ポイント表示位置 Y座標補正02 */
	export const POS_POINT_OFFSET_Y_2: number = -30;
	/** コンボ桁数 */
	export const COMBO_DIGIT: number = 3;
	/** コンボ倍率の除数 */
	export const COMBO_DIVISOR: number = 55;
	/** コンボアニメのピボット */
	export const COMBO_PIVOT: string = "num3_pivot";

	/** ポップスコアのピボット */
	export const POP_SCORE_PIVOT: string = "point_pivot";
	/** ポップスコアの符号なし表示ラベル桁 */
	export const POP_SCORE_DIGIT: number = 4;
}
