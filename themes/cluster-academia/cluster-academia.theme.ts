// The cluster-academia theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in cluster-academia.settings.json and the generated cluster-academia.settings.ts;
// change them with `astryx experimental theme editor set cluster-academia ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {clusterAcademiaSettings} from './cluster-academia.settings';

export const clusterAcademiaTheme = defineTheme({
  extends: clusterAcademiaSettings,
  name: 'cluster-academia',
});
