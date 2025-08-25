import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddButton from '../components/addPlan/AddButton';
import AddPlanHeader from '../components/addPlan/AddPlanHeader';
import DateTimeSelector from '../components/addPlan/DateTimeSelector';
import EventTypeSelector from '../components/addPlan/EventTypeSelector';
import PlanInputFields from '../components/addPlan/PlanInputFields';
import RepeatOption, { RepeatConfig } from '../components/addPlan/RepeatOption';
import SaveOption from '../components/addPlan/SaveOption';

export default function AddPlanScreen() {
  const insets = useSafeAreaInsets();
  const [eventType, setEventType] = useState<'group' | 'personal'>('personal');
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState('23');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  const [repeatOption, setRepeatOption] = useState('안함');
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>({
    enabled: false,
    freq: 'WEEKLY',
    interval: 1,
    byDays: [],
    until: null,
    count: null,
    exceptions: null
  });
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  const handleAddPlan = () => {
    // TODO: 일정 추가 로직 구현
    console.log('일정 추가:', {
      eventType,
      isPublic,
      title,
      location,
      content,
      selectedDate,
      startTime,
      endTime,
      repeatOption,
      repeatConfig,
      isSaveEnabled
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AddPlanHeader 
        isPublic={isPublic} 
        onTogglePublic={() => setIsPublic(!isPublic)} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <EventTypeSelector 
          selectedType={eventType} 
          onSelectType={setEventType} 
        />
        
        <PlanInputFields
          title={title}
          location={location}
          content={content}
          onTitleChange={setTitle}
          onLocationChange={setLocation}
          onContentChange={setContent}
        />
        
        <DateTimeSelector
          selectedDate={selectedDate}
          startTime={startTime}
          endTime={endTime}
          onDateSelect={setSelectedDate}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />
        
        <RepeatOption
          selectedOption={repeatOption}
          onOptionChange={setRepeatOption}
          repeatConfig={repeatConfig}
          onRepeatConfigChange={setRepeatConfig}
        />
        
        <SaveOption
          isEnabled={isSaveEnabled}
          onToggle={() => setIsSaveEnabled(!isSaveEnabled)}
        />
      </ScrollView>
      
      <AddButton onPress={handleAddPlan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
