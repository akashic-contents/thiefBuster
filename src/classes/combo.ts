import { asaEx } from "../util/asaEx";
import { entityUtil } from "../util/entityUtil";

/**
 * コンボエフェクトクラス
 */
export class Combo {
	/** 属するシーン */
	private scene: g.Scene = null;
	/** 現在のコンボ数 */
	private comboNum: number = 0;
	/** コンボ表記用ラベル */
	private label: g.Label;
	/** 空のコンボアニメ */
	private actor: asaEx.Actor;
	/** コンボアニメ名 */
	private animName: string;
	/** コンボ倍率除数 */
	private divisor: number;

	/**
	 * 初期値の設定
	 * @param  {g.Scene}        _scene     シーン
	 * @param  {g.E}            _parent    親エンティティ
	 * @param  {g.BitmapFont}   _font      コンボフォント
	 * @param  {string}         _asaPjName コンボASAのpj
	 * @param  {string}         _animName  コンボアニメ名
	 * @param  {g.CommonOffset} _pos       アニメ位置
	 * @param  {number}         _digit     コンボ桁
	 * @param  {number}         _divisor   コンボ倍率除数
	 * @param  {string}         _pivot     コンボアタッチピボット
	 */
	constructor(
		_scene: g.Scene,
		_parent: g.E,
		_font: g.BitmapFont,
		_asaPjName: string,
		_animName: string,
		_pos: g.CommonOffset,
		_digit: number,
		_divisor: number,
		_pivot: string
	) {
		this.scene = _scene;
		this.animName = _animName;
		this.divisor = _divisor;

		let defaultText: string = "";
		for (; _digit > defaultText.length; defaultText += "0"); // コンボ用ラベル初期テキスト作成
		// コンボ用ラベル3桁左よせ
		this.label = entityUtil.createLabel(
			this.scene,
			defaultText,
			_font,
			_digit,
			"left"
		);
		this.label.onUpdate.add((): void => {
			entityUtil.setLabelText(this.label, String(this.comboNum));
		});

		// コンボアニメ
		this.actor = new asaEx.Actor(this.scene, _asaPjName, _animName);
		this.actor.moveTo(_pos);
		this.actor.pause = true;
		entityUtil.hideEntity(this.actor);
		entityUtil.appendEntity(this.actor, _parent);

		// アタッチメントを作成
		const attachCombo: asaEx.EntityAttachment = new asaEx.EntityAttachment(this.label);
		this.actor.attach(attachCombo, _pivot); // コンボアニメにラベルをアタッチ

		this.actor.onUpdate.add(() => {
			this.actor.modified();
			this.actor.calc();
		},                      this.actor);
	}

	/**
	 *  ゲーム毎の初期化
	 */
	init(): void {
		this.comboNum = 0;
		entityUtil.hideEntity(this.actor);
	}

	/**
	 * コンボスコアを取得
	 * コンボの増減も実施
	 * @param  {number} _value 計算するスコア
	 * @return {number}        コンボスコア
	 */
	getComboValue(_value: number): number {
		if (_value < 0) { // マイナスの場合
			entityUtil.hideEntity(this.actor);
			this.comboNum = 0;
			return _value;
		} else {
			this.comboNum += 1;
			return this.calcComboValue(_value); // キルカウントからコンボスコアを計算
		}
	}

	/**
	 * コンボアニメを再生
	 */
	playComboAnim(): void {
		if (this.comboNum >= 2) {
			entityUtil.showEntity(this.actor);
			this.actor.play(this.animName, 0, false, 1.0);
		}
	}
	/**
	 * コンボ計算
	 * @param  {number} _plusScore スコア
	 * @return {number}            コンボ倍率を掛けたスコアを四捨五入したもの
	 */
	private calcComboValue(_plusScore: number): number {
		// 倍率 コンボ1 = 1 + (1-1 / 倍率除数)、コンボ2 = 1 + (2-1 / 倍率除数)、コンボ3 = 1 + (3-1 / 倍率除数)...
		const scale: number = 1 + ((this.comboNum - 1) / this.divisor);
		return Math.round(_plusScore * scale); // 四捨五入
	}

}
