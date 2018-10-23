import { asaEx } from "../util/asaEx";
import { entityUtil } from "../util/entityUtil";

/**
 * 指定した場所で符号つき数字ラベルを表示するクラス
 */
export class PopScore {
	/** 属するシーン */
	private scene: g.Scene;
	/** 親レイヤー */
	private layer: g.E;
	/** プラス用フォント */
	private fontPlus: g.BitmapFont;
	/** マイナス用フォント */
	private fontMinus: g.BitmapFont;
	/** ポップアニメpj */
	private asaPjName: string;
	/** プラス時アニメ */
	private plusAnimName: string;
	/** マイナス時アニメ */
	private minusAnimName: string;
	/** actorアタッチ時のY座標補正値 */
	private actorPosOffsetY: number;
	/** ラベルアタッチ時のY座標補正値 */
	private labelPosOffsetY: number;
	/** アタッチ用ピボット */
	private pivot: string;
	/** 符号なし表示ラベル桁 */
	private digit: number;

	/**
	 * 初期値の設定
	 * @param  {g.Scene}      _scene           シーン
	 * @param  {g.E}          _parent          親エンティティ
	 * @param  {g.BitmapFont} _fontPlus        プラス用フォント
	 * @param  {g.BitmapFont} _fontMinus       マイナス用フォント
	 * @param  {string}       _asaPjName       ポップアニメpj
	 * @param  {string}       _plusAnimName    プラス時アニメ
	 * @param  {string}       _minusAnimName   マイナス時アニメ
	 * @param  {number}       _actorPosOffsetY actorアタッチ時のY座標補正値
	 * @param  {number}       _labelPosOffsetY ラベルアタッチ時のY座標補正値
	 * @param  {string}       _pivot           アタッチ用ピボット
	 * @param  {number}       _digit           符号なし表示ラベル桁
	 */
	constructor(
		_scene: g.Scene,
		_parent: g.E,
		_fontPlus: g.BitmapFont,
		_fontMinus: g.BitmapFont,
		_asaPjName: string,
		_plusAnimName: string,
		_minusAnimName: string,
		_actorPosOffsetY: number,
		_labelPosOffsetY: number,
		_pivot: string,
		_digit: number
	) {
		this.scene = _scene;
		this.layer = _parent;
		this.fontPlus = _fontPlus;
		this.fontMinus = _fontMinus;
		this.asaPjName = _asaPjName;
		this.plusAnimName = _plusAnimName;
		this.minusAnimName = _minusAnimName;
		this.actorPosOffsetY = _actorPosOffsetY;
		this.labelPosOffsetY = _labelPosOffsetY;
		this.pivot = _pivot;
		this.digit = _digit;
	}

	/**
	 * プラス/マイナススコア生成
	 * @param  {g.CommonOffset} _pos   座標
	 * @param  {number}         _value スコア
	 */
	createPopScore(_pos: g.CommonOffset, _value: number): void {
		let popAnime: string = this.plusAnimName;
		let font: g.BitmapFont = this.fontPlus; // プラスフォント
		let sign: string = "+"; // 符号
		if (_value < 0) { // マイナスの場合
			popAnime = this.minusAnimName;
			font = this.fontMinus; // マイナスフォント
			sign = ""; // 符号いらず
		}

		// ポイント演出用ダミーアニメ
		const actorPopPoint: asaEx.Actor = new asaEx.Actor(
			this.scene,
			this.asaPjName
		);
		actorPopPoint.moveTo(_pos.x, _pos.y + this.actorPosOffsetY);
		entityUtil.appendEntity(actorPopPoint, this.layer);
		actorPopPoint.play(popAnime, 0, false, 1.0); // ループなしで再生

		const label: g.Label = entityUtil.createNumLabel(this.scene, font, this.digit + 1);
		entityUtil.moveNumLabelTo( // appendした箇所からの相対座標
			label,
			0 + label.bitmapFont.defaultGlyphWidth,
			0 + this.labelPosOffsetY - (label.bitmapFont.defaultGlyphHeight / 2)
		);
		entityUtil.setLabelText(label, sign + String(_value)); // 符号つきテキスト

		// アタッチメント
		const attachment: asaEx.EntityAttachment = new asaEx.EntityAttachment(label);
		actorPopPoint.attach(attachment, this.pivot); // ダミーアニメにアタッチ

		actorPopPoint.update.handle(actorPopPoint, (): boolean => {
			actorPopPoint.modified();
			actorPopPoint.calc();
			// 自身を破棄
			if (actorPopPoint.currentFrame >= actorPopPoint.animation.frameCount - 1) {
				actorPopPoint.removeAttachment(attachment); // アタッチに子供がいるとdestroyで残るため
				actorPopPoint.destroy(); // アタッチしたコンボ、appendしたラベルも消える
			}
			return false;
		});
	}
}
