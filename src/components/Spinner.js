import React from 'react'

const styles = {
  element: {
    width: '40px',
    height: '40px',
    position: 'relative',
    margin: '100px auto',
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#333',
    opacity: 0.6,
    position: 'absolute',
    top: 0,
    left: 0,
    animation: 'bounce 2.0s infinite ease-in-out',
  },
  second: {
    animationDelay: '-1.0s',
  }
}

export default ({ ...props }) => (
  <div style={styles.element}>
    <div style={styles.circle}></div>
    <div style={{ ...styles.circle, ...styles.second}}></div>
  </div>
)
