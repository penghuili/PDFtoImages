import { connect } from 'react-redux';
import { sharedActionCreators } from '../shared/react/store/sharedActions';
import PDFtoImages from './PDFtoImages';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  onToast: sharedActionCreators.setToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(PDFtoImages);
