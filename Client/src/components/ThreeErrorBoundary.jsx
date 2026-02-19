import React from 'react';
import { motion } from 'framer-motion';
import FallbackGlobe from './FallbackGlobe';

class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.log('Falling back to 2D globe due to 3D error:', this.state.error);
      return (
        <FallbackGlobe
          onBrandClick={this.props.onBrandClick}
          onPrivacyClick={this.props.onPrivacyClick}
          showAuth={this.props.showAuth}
        />
      );
    }

    return this.props.children;
  }
}

export default ThreeErrorBoundary;