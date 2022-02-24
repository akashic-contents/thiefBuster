import { asaEx } from "../util/asaEx";
import { entityUtil } from "../util/entityUtil";
import { AsaInfo } from "./asaInfo";
import { define } from "./define";

/**
 * 弾管理クラス
 */
export class Bullet {
	/** 弾 */
	private spr: asaEx.Actor = null;
	/** 弾耐久値 */
	private life: number = null;
	/** 弾速 */
	private moveX: number = define.BULLET_MOVE_X;
	/** コンボ */
	private kill: number = 0;

	/**
	 * パラメータに応じた弾の生成
	 * @param  {g.Scene}            _scene  シーン
	 * @param  {g.E}                _parent 親エンティティ
	 * @param  {define.BulletLevel} _level  弾レベル
	 * @param  {g.CommonOffset}     _pos    生成座標
	 */
	constructor(
		_scene: g.Scene,
		_parent: g.E,
		_level: define.BulletLevel,
		_pos: g.CommonOffset
	) {
		let animeName: string;
		let size: g.CommonSize;
		switch (_level) { // ワークマンのレベルから弾の種類を決定
			case define.BulletLevel.nail:
				animeName = AsaInfo.bullet.anim.weapon01;
				size = { width: AsaInfo.bullet.w01, height: AsaInfo.bullet.h01 };
				break;
			case define.BulletLevel.screwDriver:
				animeName = AsaInfo.bullet.anim.weapon02;
				size = { width: AsaInfo.bullet.w02, height: AsaInfo.bullet.h02 };
				break;
			case define.BulletLevel.spanner:
				animeName = AsaInfo.bullet.anim.weapon03;
				size = { width: AsaInfo.bullet.w03, height: AsaInfo.bullet.h03 };
				break;
			case define.BulletLevel.hammer:
				animeName = AsaInfo.bullet.anim.weapon04;
				size = { width: AsaInfo.bullet.w04, height: AsaInfo.bullet.h04 };
				break;
			default:
				animeName = AsaInfo.bullet.anim.weapon01;
				break;
		}
		this.spr = new asaEx.Actor(_scene, AsaInfo.bullet.pj, animeName);
		this.spr.moveTo(_pos);
		this.spr.width = size.width; // 種類ごとの大きさ設定
		this.spr.height = size.height;
		entityUtil.appendEntity(this.spr, _parent);
		this.spr.modified();
		this.life = _level; // 生成時のレベルに応じてライフを設定
		// 周りの状況に限らずアニメの更新と移動を行う
		this.spr.onUpdate.add(this.update, this);
	}

	/**
	 * ゲーム中の更新処理
	 * @return {boolean} 通常falseを返す
	 */
	update(): boolean {
		if (!this.spr.destroyed()) {
			this.spr.x += this.moveX;
			this.spr.modified();
			this.spr.calc();
		}
		return false;
	}

	/**
	 * 泥棒に当たった時
	 */
	minusLife(): void {
		this.life -= 1;
		if (this.life <= 0) { // 弾の寿命が尽きる時
			this.destroySpr(); // 弾消す処理
		}
	}

	/**
	 * 弾現在位置取得
	 * @return {g.CommonOffset} 弾現在位置（原点）
	 */
	getPosition(): g.CommonOffset {
		return {
			x: this.spr.x,
			y: this.spr.y
		};
	}

	/**
	 * 弾当たり判定用エリア取得
	 * @return {g.CommonArea} 当たり領域
	 */
	getCollArea(): g.CommonArea {
		// 原点が中心なので計算して返す
		return {
			x: this.spr.x - (this.spr.width / 2), // 左上
			y: this.spr.y - (this.spr.height / 2), // 左上
			width: this.spr.width,
			height: this.spr.height
		};
	}

	/**
	 * 倒した数取得
	 * @return {number} 倒した数
	 */
	getKill(): number {
		return this.kill;
	}

	/**
	 * sprが削除されたか調べる
	 * @return {boolean} 削除されていたらtrue
	 */
	checkSprDestroyed(): boolean {
		return this.spr.destroyed();
	}

	/**
	 * 倒した数加算
	 */
	addKill(): void {
		if (this.kill >= define.MAX_COMBO) { // MAX以上は加算しない
			return;
		}
		this.kill += 1;
	}

	/**
	 * sprのdestroy
	 */
	destroySpr(): void {
		if (!this.spr.destroyed()) {
			this.spr.destroy();
		}
	}

}
