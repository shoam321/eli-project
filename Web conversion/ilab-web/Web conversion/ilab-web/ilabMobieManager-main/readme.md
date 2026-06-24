/ilabMobieManager/node_modules/react-native/Libraries/Image/RCTUIImageViewAnimated.m
278

- (void)displayLayer:(CALayer \*)layer
  {
  if (\_currentFrame) {
  layer.contentsScale = self.animatedImageScale;
  layer.contents = (\_\_bridge id)\_currentFrame.CGImage;
  } else {
  [super displayLayer:layer];
  }
  }
