import { asaEx } from "../util/asaEx";
import { entityUtil } from "../util/entityUtil";
import { AsaInfo } from "./asaInfo";
import { define } from "./define";
import { GameParameterReader } from "./gameParameterReader";

/**
 * ワークマン管理クラス
 */
export class Workman {
	/** 属するゲーム */
	private game: g.Game = null;
	/** ワークマンとゴンドラ */
	private spr: asaEx.Actor = null;
	/** ワークマン手 */
	private sprHand: asaEx.Actor = null;
	/** ワークマン手アタッチメント */
	private attachHand: asaEx.ActorAttachment = null;
	/** 攻撃中 */
	private flgAttack: boolean = false;
	/** 攻撃中停止位置 */
	private stopFrame: number = 0;
	/** 攻撃中カウンタ */
	private cntStop: number = 0;
	/** 弾レベル */
	private level: define.BulletLevel = null;
	/** ゴンドラスピード */
	private gondolaSpeed: number = 1.0;

	/**
	 * ワークマンの作成
	 * @param  {g.Scene} _scene  シーン
	 * @param  {g.E}     _parent 親エンティティ
	 */
	constructor(_scene: g.Scene, _parent: g.E) {
		this.game = _scene.game;

		this.level = define.BulletLevel.nail;

		this.spr = new asaEx.Actor(
			_scene,
			AsaInfo.workman.pj,
			AsaInfo.workman.anim.gondola
		);
		this.spr.moveTo(this.game.width / 2, this.game.height / 2);
		entityUtil.appendEntity(this.spr, _parent);

		this.sprHand = new asaEx.Actor(
			_scene,
			AsaInfo.workman.pj,
			AsaInfo.workman.anim.hand
		);
		// アタッチ
		this.attachHand = new asaEx.ActorAttachment(this.sprHand);
		this.spr.attach(this.attachHand, define.WKMAN_ATTACH_POINT_GONDOLA);
		this.changeHand(define.WKMAN_ATTACH_POS_NORMAL, AsaInfo.workman.anim.hand);

		this.spr.modified();
		this.spr.calc();
		this.sprHand.modified();
		this.sprHand.calc();
	}

	/**
	 * ゲーム毎の初期化
	 */
	init(): void {
		this.level = GameParameterReader.startItemLevel;
		this.flgAttack = false;
		this.cntStop = 0;
		this.spr.play(AsaInfo.workman.anim.gondola, 0, true, this.gondolaSpeed);
		this.changeHand(define.WKMAN_ATTACH_POS_NORMAL, AsaInfo.workman.anim.hand);
	}

	/**
	 * ゲーム中の更新処理
	 */
	update(): void {
		if (this.flgAttack) { // 攻撃中
			++this.cntStop;
			// 攻撃時フレームでゴンドラ止める
			this.spr.play(
				AsaInfo.workman.anim.gondola,
				this.stopFrame,
				true,
				this.gondolaSpeed
			);
			if (this.cntStop > define.ATTCK_STOP_TIME) { // リロード完了
				this.flgAttack = false;
				this.cntStop = 0;
				// 通常腕に戻す
				this.changeHand(
					define.WKMAN_ATTACH_POS_NORMAL,
					AsaInfo.workman.anim.hand
				);
				// ゴンドラ移動反転
				// 往復で1アニメの場合 (総フレーム数 - 現在のフレーム - 1)
				this.spr.play(
					AsaInfo.workman.anim.gondola,
					this.spr.animation.frameCount - this.stopFrame - 1,
					true,
					this.gondolaSpeed
				);
			}
		}
		if (this.spr) {
			this.spr.modified();
			this.spr.calc();
		}
		if (this.sprHand) {
			this.sprHand.modified();
			this.sprHand.calc();
		}
	}

	/**
	 * ワークマンアタック
	 */
	pointDown(): void {
		if (this.flgAttack) { // 攻撃中なら
			return;
		}

		this.flgAttack = true; // 攻撃中フラグオン
		this.stopFrame = this.spr.currentFrame; // 攻撃時フレーム（ゴンドラ高さ）記憶
		this.cntStop = 0;
		this.changeHand(define.WKMAN_ATTACH_POS_ATTACK, AsaInfo.workman.anim.attack); // 攻撃腕に
	}

	/**
	 * 攻撃位置取得
	 * @return {g.CommonOffset} 攻撃腕のポイント
	 */
	getAttackPosition(): g.CommonOffset {
		return this.spr.getBonePositionInScene(define.WKMAN_ATTACH_POINT_ATTACK);
	}

	/**
	 * 弾レベル取得
	 * @return {define.BulletLevel} 弾レベル
	 */
	getLevel(): define.BulletLevel {
		return this.level;
	}

	/**
	 * レベルアップ
	 */
	plusLevel(): void {
		if (this.level === define.BulletLevel.hammer) { // すでに最強なら処理しない
			return;
		}
		this.level += 1;
	}

	/**
	 * 攻撃中フラグ取得
	 * @return {boolean} 攻撃中フラグ
	 */
	isAttack(): boolean {
		return this.flgAttack;
	}

	/**
	 * 手の切り替え
	 * @param {g.CommonOffset} _attachPoint 新しいアタッチポイント
	 * @param {string}         _anime       新しいアニメ
	 */
	private changeHand(_attachPoint: g.CommonOffset, _anime: string): void {
		this.sprHand.moveTo(_attachPoint);
		// 新しいアニメ 攻撃腕の場合でも投げきった状態で止めるのでloopはfalse
		this.sprHand.play(_anime, 0, false, 1.0);
	}

}
