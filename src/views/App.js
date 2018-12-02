import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Header from 'views/layout/Header'
import Navigation from 'views/layout/Navigation'
import Trending from 'views/pages/Trending'
import Collection from 'views/pages/Collection'
import Search from 'views/pages/Search'
import Movie from 'views/pages/Movie'
import Star from 'views/pages/Star'
import Configure from 'views/pages/Configure'
import Logs from 'views/pages/Logs'

const styles = {
  element: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  }
}

export default ({ ...props }) => (
  <Router>
    <div style={styles.element}>
      <Header key="header" />
      <Navigation key="navigation" />
      <Route path="/" exact component={Trending} />
      <Route path="/collection" exact component={Collection} />
      <Route path="/search/:state/:query?" exact component={Search} />
      <Route path="/movie/:id" exact component={Movie} />
      <Route path="/star/:id" exact component={Star} />
      <Route path="/configure" exact component={Configure} />
      <Route path="/logs" exact component={Logs} />
    </div>
  </Router>
)
