/**
 * 泥棒バスターの難易度設定データの型
 */
export interface DifficultyParameter {
	/** このパラメータが適用される難易度の最小値 */
	minimumDifficulty: number;
	/** 敵の出現パターンを指定するパラメータ */
	embedNumber: number[];
	/** アイテムの出現間隔を指定するパラメータ */
	itemPopInterval: number;
	/** スタート時アイテムを指定するパラメータ */
	startItemLevel: number;
}

/**
 * 泥棒バスターの難易度設定データJSONの型
 */
export interface DifficultyParametersJson {
	/**
	 * 難易度設定データの配列
	 * minimumDifficultyが小さいものから並べる
	 */
	difficultyParameterList: DifficultyParameter[];
}
