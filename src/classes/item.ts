import { audioUtil } from "../util/audioUtil";
import { asaEx } from "../util/asaEx";
import { entityUtil } from "../util/entityUtil";
import { AsaInfo } from "./asaInfo";
import { define } from "./define";
import { SoundInfo } from "./soundInfo";

/** アイテムアニメ種類 */
interface ItemAnimeType {
	/** 出現 */
	in: string;
	/** ゲット */
	get: string;
	/** 待機 */
	stay: string;
	/** 消失 */
	lost: string;
}

/** アイテム種類数 ドライバー、スパナ、ハンマー */
const NUM_OF_ITEM_TYPE: number = 3;
/** 各アイテムのアニメ種類数 出現、取得、留まる、点滅 */
const NUM_OF_ITEM_ANIME: number = 4;

/**
 * アイテム管理クラス
 */
export class Item {
	/** 属するゲーム */
	private game: g.Game = null;
	/** アイテム */
	private spr: asaEx.Actor = null;
	/** 消滅カウント */
	private cntVanish: number = 0;
	/** アイテムごとのアニメ種類管理配列 */
	private animeTypes: ItemAnimeType[];
	/** ワークマンレベル */
	private level: define.BulletLevel = null;
	/** 出現Y位置リスト */
	private popPositionListY: number[] = define.POS_ITEM_POP_LIST_Y;

	/**
	 * AsaInfoからアニメ情報の紐付けと初期アイテムの生成
	 * @param  {g.Scene} _scene  シーン
	 * @param  {g.E}     _parent 親エンティティ
	 */
	constructor(_scene: g.Scene, _parent: g.E) {
		this.game = _scene.game;

		const wkAnimeNames: string[] = [];
		let index: number = 0; // アニメ全種類数えるようインデックス
		for (const key in AsaInfo.item.anim) {
			// asainfo.animから順番に配列に格納
			if (AsaInfo.item.anim.hasOwnProperty(key)) {
				wkAnimeNames[index] = (<{ [key: string]: string }>(<Object>AsaInfo.item.anim))[key];
				++index;
			}
		}
		index = 0;
		this.animeTypes = new Array(NUM_OF_ITEM_TYPE); // アイテムアニメ管理用

		for (let i = 0; i < this.animeTypes.length; ++i) { // アイテムアニメ管理用配列 代入
			// 初期化しないとエラーになる
			this.animeTypes[i] = {
				in: "",
				get: "",
				stay: "",
				lost: ""
			};

			for (let j = 0; j < NUM_OF_ITEM_ANIME; ++j) { // アニメ種類ループ
				if (index % NUM_OF_ITEM_ANIME === 0) { // 規則的に並んでること前提
					this.animeTypes[i].in = wkAnimeNames[index];
				} else if (index % NUM_OF_ITEM_ANIME === 1) {
					this.animeTypes[i].get = wkAnimeNames[index];
				} else if (index % NUM_OF_ITEM_ANIME === 2) {
					this.animeTypes[i].stay = wkAnimeNames[index];
				} else if (index % NUM_OF_ITEM_ANIME === 3) {
					this.animeTypes[i].lost = wkAnimeNames[index];
				}
				++index;
			}
		}

		this.level = define.BulletLevel.nail; // 最初はクギ
		this.spr = new asaEx.Actor(
			_scene,
			AsaInfo.item.pj,
			this.animeTypes[this.level - 1].in
		);
		entityUtil.appendEntity(this.spr, _parent);
		// 周りの状況に限らずアニメの更新と自動消滅を行う
		this.spr.onUpdate.add(this.update, this);
		// インスタンスは一つしか作らないのでshowとhideを繰り返す
		entityUtil.hideEntity(this.spr);
	}

	/**
	 * ゲーム毎の初期化
	 */
	init(): void {
		this.level = define.BulletLevel.nail;
		entityUtil.hideEntity(this.spr);
	}

	/**
	 * ゲーム中の更新処理 this.spr.updateのハンドラ
	 * @return {boolean} 通常falseを返す
	 */
	update(): boolean {
		if (!this.spr.destroyed()) {
			this.animeController();
			this.spr.modified();
			this.spr.calc();
		}
		return false;
	}

	/**
	 * アイテムの出現（show）
	 * @param  {define.BulletLevel} _level 弾レベル
	 */
	popItem(_level: define.BulletLevel): void {
		if (this.spr.visible()) { // 出現中は処理しない
			return;
		}
		if (_level >= define.BulletLevel.hammer) { // レベルがハンマー時は処理しない
			return;
		}
		const randomX = Math.floor(
			this.game.random.generate() * (define.POS_ITEM_POP_X_MAX - define.POS_ITEM_POP_X_MIN) + define.POS_ITEM_POP_X_MIN
		);
		const randomY = Math.floor(this.game.random.generate() * 3);
		const pos: g.CommonOffset = {
			x: randomX,
			y: this.popPositionListY[randomY]
		};
		this.level = _level;
		this.cntVanish = 0;
		this.spr.moveTo(pos);
		this.spr.play(this.animeTypes[_level - 1].in, 0, false, 1.0);
		audioUtil.play(SoundInfo.seSet.itemPop);
		entityUtil.showEntity(this.spr);
	}

	/**
	 * 現在位置取得
	 * @return {g.CommonOffset} 現在位置
	 */
	getPosition(): g.CommonOffset {
		return { x: this.spr.x, y: this.spr.y };
	}

	/**
	 * アイテム当たり判定用エリア取得
	 * @return {g.CommonArea} 当たり領域
	 */
	getCollArea(): g.CommonArea {
		// 原点が中心なので左上基準に計算して返す
		return {
			x: this.spr.x - (AsaInfo.item.w / 2),
			y: this.spr.y - (AsaInfo.item.h / 2),
			width: AsaInfo.item.w,
			height: AsaInfo.item.h
		};
	}

	/**
	 * アニメをgetに変更
	 */
	setAnimeGet(): void {
		audioUtil.play(SoundInfo.seSet.itemGet);
		this.spr.play(this.animeTypes[this.level - 1].get, 0, false, 1.0);
	}

	/**
	 * 現在当たり判定できるか否か
	 * @return {boolean} できるならtrue
	 */
	checkCollisionStat(): boolean {
		if (!this.spr.visible()) { // 見えてないときは当たり判定しない
			return false;
		}
		// 出現アニメの時は当たり判定をしない
		if (this.spr.animation.name === this.animeTypes[this.level - 1].in) {
			return false;
		}
		// ゲットアニメの時は当たり判定をしない
		if (this.spr.animation.name === this.animeTypes[this.level - 1].get) {
			return false;
		}
		return true;
	}

	/**
	 * アニメ管理
	 */
	private animeController(): void {
		const actor: asaEx.Actor = this.spr; // 短縮
		const nowAnime: string = actor.animation.name; // 現在再生中のアニメ名
		const anime: ItemAnimeType = this.animeTypes[this.level - 1]; // 現レベルのアニメたち
		let playAnime: string = nowAnime; // 最終的に再生するアニメ とりあえず今のアニメ
		let flgLoop: boolean = false; // アニメをループさせるか否か

		switch (nowAnime) { // 現在再生中のアニメ名によって処理
			case anime.in: // 出現アニメ
				if (actor.currentFrame >= actor.animation.frameCount - 1) { // アニメ完了
					playAnime = anime.stay; // 滞在アニメへ
				}
				break;

			case anime.stay: // 滞在アニメ
				flgLoop = true; // ループさせる
				this.cntVanish += 1; // 点滅するまでの時間カウント
				if (this.cntVanish >= define.ITEM_VANISH_LENGTH) { // 規定の時間に達したら
					playAnime = anime.lost; // 消滅アニメに移行
				}
				break;

			case anime.get: // 取得アニメ
				if (actor.currentFrame >= actor.animation.frameCount - 1) {
					playAnime = anime.lost; // 一応消滅アニメに
					entityUtil.hideEntity(this.spr); // 隠す
					return;
				}
				break;
			case anime.lost:
				if (actor.currentFrame >= actor.animation.frameCount - 1) {
					entityUtil.hideEntity(this.spr); // 隠す
					return;
				}
				break;
		}

		if (nowAnime === playAnime) { // switch中にアニメが変わらなければ
			return; // 何もせず
		}
		actor.play(playAnime, 0, flgLoop, 1.0); // 新しいアニメをゼロから再生開始
	}

}
