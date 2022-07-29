import { useEffect, useState } from 'react';
import * as React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Image,
  Dimensions,
  FlatList,
  Animated,
  TouchableOpacity
} from 'react-native';
import CarouselItem from './CarouselItem';
import { default as ThemeStoreDefault } from 'framework/store/ThemeStore';
import Skeleton from 'native/components/Skeleton/Skeleton';

const { width } = Dimensions.get('window');
let flatListScroll;

let paused = {
  1: false,
  2: false,
  3: false,
}
let scrollValue = {
  1: 0,
  2: 0,
  3: 0,
};
let scrolled = {
  1: 1,
  2: 1,
  3: 1,
};

const Carousel = ({
  style,
  priority,
  data,
  onPress,
  itemHorizontalMargin = 16,
  itemHeight = 140,
  dotColor = ThemeStoreDefault.colorSet.COLOR_GREEN
}) => {
  const scrollX = new Animated.Value(0);
  let position = Animated.divide(scrollX, width);
  const [dataList, setDataList] = useState(data);

  let _ref = React.useRef();
  

  function inifiniteScroll(dataList) {
    const numberOfData = dataList.length;
    
    
    setInterval(function() {
      if(paused[priority]) return

      if (scrolled[priority] < numberOfData) {
        scrolled[priority]++
        scrollValue[priority] = scrollValue[priority] + width;
      } else {
        scrollValue[priority] = 0;
        scrolled[priority] = 1;
      }

      _ref.current.scrollToOffset({
        animated: true,
        offset: scrollValue[priority]
      });
      
      
    }, 5000);
  }

  useEffect(() => {
    setDataList(data);
    inifiniteScroll(dataList);
  },[]);

  return (
    <View style={[style]}>
      <FlatList
        ref={_ref}
        data={data}
        keyExtractor={(item, index) => 'key' + index}
        horizontal
        pagingEnabled={true}
        scrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                onPress(priority, item.id, item.link);
              }}
            >
              <CarouselItem
                item={item}
                itemHorizontalMargin={itemHorizontalMargin}
                itemHeight={itemHeight}
              />
            </TouchableOpacity>
          );
        }}
        onScrollBeginDrag={() => {
          paused[priority] = true
        }}
        onScrollEndDrag={(dataScroll) => {
          paused[priority] = false
          scrolled[priority] = Math.round(dataScroll.nativeEvent.contentOffset.x / (width - itemHorizontalMargin * 2)) 
          scrollValue[priority] = scrolled[priority] * width
        }}
        
        onScroll={ Animated.event(
          [
            {
              nativeEvent: { contentOffset: { x: scrollX } },
            }
          ],
          {useNativeDriver: false}
          )}
      />

      <View style={styles.dotView}>
        {data.map((_, i) => {
          let opacity = position.interpolate({
            inputRange: [i - 1, i, i + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp'
          });

          return (
            <Animated.View
              key={i}
              style={{
                opacity: opacity,
                height: 10,
                width: 10,
                backgroundColor: dotColor,
                margin: 8,
                borderRadius: 5
              }}
            />
          );
        })}
      </View>
    </View>
  );

};

const styles = StyleSheet.create({
  dotView: {
    flexDirection: 'row',
    justifyContent: 'center'
  }
});

export default Carousel;
