import postcssGlobalData from '@csstools/postcss-global-data'
import postcssCustomMedia from 'postcss-custom-media'

export default {
  plugins: [
    // 讓 custom-media.css 的 @custom-media 定義對所有樣式檔（含 SFC）可見
    postcssGlobalData({
      files: ['.vitepress/theme/custom-media.css'],
    }),
    postcssCustomMedia(),
  ],
}
