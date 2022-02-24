import * as tl from "@akashic-extension/akashic-timeline";
import { entityUtil } from "../util/entityUtil";
import { define } from "./define";
import { gameUtil } from "../util/gameUtil";

/** スコア強調時間：OFF→ON */
const SCORE_TIME_ON: number = 3;
/** スコア強調時間：ON→OFF */
const SCORE_TIME_OFF: number = 7;
/** スコア強調スケール：OFF→ON */
const SCORE_SCALE_ON: number = 1.1;
/** スコア強調スケール：ON→OFF */
const SCORE_SCALE_OFF: number = 1.0;
/** スコア強調時移動調整距離 */
const SCORE_SCALE_MOVE_X: number = 8;

/**
 * スコア処理を行うクラス
 */
export class Score extends g.E {
	/** スコアラベル */
	private label: g.Label = null;
	/** ラベル初期位置 */
	private posLabelStart: g.CommonOffset = null;
	/** 現在のスコア */
	private value: number = null;
	/** スコア加算演出用スタック */
	private stack: number = null;
	/** 加算幅 */
	private plus: number = null;
	/** スコア演出用タイムライン */
	private timeline: tl.Timeline;

	/**
	 * 継承元のg.Eのコンストラクタを呼び、タイムラインインスタンスを作成する
	 * @param  {g.Scene} _scene シーン
	 */
	constructor(_scene: g.Scene) {
		super({ scene: _scene });
		this.timeline = new tl.Timeline(_scene);
		this.plus = 10;
	}
	/**
	 * 表示系以外のオブジェクトをdestroyするメソッド
	 * 表示系のオブジェクトはg.Eのdestroyに任せる。
	 * @override
	 */
	destroy(): void {
		if (this.destroyed()) {
			return;
		}
		if (this.timeline) {
			this.timeline.destroy();
			this.timeline = null;
		}
		super.destroy();
	}
	/**
	 * ラベルの作成
	 * @param {g.BitmapFont}   _font     スコア用フォント
	 * @param {number}         _digit    桁数
	 * @param {g.CommonOffset} _posStart 初期位置
	 */
	createScoreLabel(
		_font: g.BitmapFont,
		_digit: number,
		_posStart: g.CommonOffset
	): void {
		this.label = entityUtil.createNumLabel(this.scene, _font, _digit);
		entityUtil.appendEntity(this.label, this);
		entityUtil.moveNumLabelTo( // 1ケタ目左上へ移動
			this.label,
			_posStart.x,
			_posStart.y,
			_font
		);
		// ラベル初期位置記憶
		this.posLabelStart = { x: this.label.x, y: this.label.y };
	}

	/**
	 * 初期化
	 */
	init(): void {
		this.value = 0;
		this.stack = 0;
		entityUtil.setLabelText(this.label, String(this.value));
	}

	/**
	 * ラベルテキストの更新
	 */
	onLabelUpdate(): void {
		entityUtil.setLabelText(this.label, String(this.value));
		this.animePlusScore();
		if (this.value < 0) {
			this.value = 0;
			this.stack = 0;
			gameUtil.updateGameStateScore(this.value);
		} else if (this.value > define.SCORE_LIMIT) {
			this.value = define.SCORE_LIMIT;
			this.stack = 0;
			gameUtil.updateGameStateScore(this.value);
		}
	}

	/**
	 * スコアのgetter
	 * @return {number} スコア
	 */
	getValue(): number {
		return this.value;
	}

	/**
	 * スタックスコアからのマージスコアを一気に足す
	 */
	mergeScore(): void {
		this.value += this.stack;
		this.stack = 0;
	}

	/**
	 * スコア加算開始
	 * @param {number} _plusScore 加算対象スコア
	 */
	startPlus(_plusScore: number): void {
		this.setStack(_plusScore);
		this.setPlus();
		this.setTween();
		gameUtil.updateGameStateScore(this.value + this.stack);
	}
	/**
	 * ゲーム終了時の処理まとめ
	 */
	onFinishGame(): void {
		this.mergeScore(); // 残ったスタックスコアを加算
		this.onLabelUpdate();
		gameUtil.updateGameStateScore(this.value + this.stack);
	}
	/**
	 * スコアをすこしずつ足す
	 */
	private animePlusScore(): void {
		if (this.stack > 0 && this.stack >= this.plus) {
			this.value += this.plus;
			this.stack -= this.plus;
		} else { // 一気足し
			this.mergeScore();
		}
	}

	/**
	 * 加算幅をスタックスコアから設定
	 */
	private setPlus(): void {
		// ラベル強調時間で終わるように
		this.plus = Math.floor(this.stack / (SCORE_TIME_ON + SCORE_TIME_OFF));
	}

	/**
	 * スコアを演出用にスタック
	 * @param {number} _plusScore 加算対象スコア
	 */
	private setStack(_plusScore: number): void {
		this.stack += _plusScore;
	}

	/**
	 * 加算時に強調する演出tween設定
	 */
	private setTween(): void {
		const scaleOff: number = SCORE_SCALE_OFF; // 縮小倍率 =原寸大
		const scaleOn: number = SCORE_SCALE_ON; // 拡大倍率 スコア桁数によって調整したい
		const fps: number = this.scene.game.fps;
		const mSec: number = 1000;
		const timeScaleOffInit: number = 1 * mSec / fps; // 初期化縮小にかけるミリ秒
		const timeScaleOn: number = SCORE_TIME_ON * mSec / fps; // 巨大化にかけるミリ秒
		const timeScaleOff: number = SCORE_TIME_OFF * mSec / fps; // 縮小にかけるミリ秒

		this.timeline.clear(); // 毎回作り直し
		const tween: tl.Tween = this.timeline.create(
			this.label,
			{
				modified: this.label.modified,
				destroyed: this.label.destroyed
			}
		);

		// tweenが重なった場合、まず元のサイズに
		tween.to({ scaleX: scaleOff, scaleY: scaleOff }, timeScaleOffInit);
		tween.con(); // 上下処理結合
		tween.moveTo( // 位置をもとに戻す
			this.posLabelStart.x,
			this.posLabelStart.y,
			timeScaleOffInit
		);
		tween.to({ scaleX: scaleOn, scaleY: scaleOn }, timeScaleOn); // 強調開始
		tween.con(); // 上下処理結合
		tween.moveTo( // 原点の問題上ずれるので調整用 計算で調整幅出したい
			this.posLabelStart.x - SCORE_SCALE_MOVE_X,
			this.posLabelStart.y,
			timeScaleOn
		);
		tween.to({ scaleX: scaleOff, scaleY: scaleOff }, timeScaleOff); // 強調終了
		tween.con(); // 上下処理結合
		tween.moveTo( // 位置をもとに戻す
			this.posLabelStart.x,
			this.posLabelStart.y,
			timeScaleOff
		);
	}
}
