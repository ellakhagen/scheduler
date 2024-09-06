import React from 'react';
import { Box, Grid, Text, GridItem } from '@chakra-ui/react';

const hours = ['7:00 am', '7:30 am', '8:00 am', '8:30 am', '9:00 am',
'9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm',
'12:30 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm',
'4:00 pm', '4:30 pm', '5:00 pm', '5:30 pm', '6:00 pm'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];


function getHoursInRange(start, end){
    const startIndex = hours.indexOf(start);
    const endIndex = hours.indexOf(end);
    return hours.slice(startIndex, endIndex);
};

function roundDown(timeStr){
    const [time, period] = timeStr.split(" ")
    const [hours, minutes] = time.split(":")

    if(minutes === "10"){
        return `${hours}:00 ${period}`
    }
    else if(minutes === "40"){
        return `${hours}:30 ${period}`
    }
    else{
        return `${hours}:${minutes} ${period}`
    }
}
  
function generateGrid(schedule){
    const grid = Array.from({ length: days.length }, () => Array.from({ length: hours.length }, () => false));
    Object.values(schedule.schedule).forEach(entry => {
        const {course_day, course_start, course_end} = entry

        const hoursToShade = getHoursInRange(roundDown(course_start), roundDown(course_end));
        const daysArray = course_day.split(/(?=[A-Z])/).map(day => {
        switch (day) {
            case 'Mo': return 0; // Monday
            case 'Tu': return 1; // Tuesday
            case 'We': return 2; // Wednesday
            case 'Th': return 3; // Thursday
            case 'Fr': return 4; // Friday
            default: return -1;
        }
        });
        
        daysArray.forEach(dayIndex => {
        if (dayIndex >= 0) {
            hoursToShade.forEach(hour => {
            const hourIndex = hours.indexOf(hour);
            grid[dayIndex][hourIndex] = true;
            });
        }
        });
    });

    return grid;
};
  
function Schedule(schedule){
    const grid = generateGrid(schedule);
  
    return (
        <Box display='flex'>
            <Grid templateColumns={`100px repeat(${days.length}, auto)`} bg='#F4F3F3'>
                <GridItem colSpan={1}>
                    <Box h='17px'/>
                    {hours.map((hour, index) => (
                    <Box key={index} h='30px' p={2} textAlign="center"
                    fontWeight="bold" border="1px"
                    borderColor='#F4F3F3'
                    rowSpan={2}
                >
                    {/* Check if hour ends with ':30' or is '7:00 am' */}
                    {hour.includes(':30') || hour === '7:00 am' ? '' : hour}
                </Box>
                    ))}
                </GridItem>
                {days.map((day, dayIndex) => (
                <GridItem key={day} colSpan={1} minWidth='100px'>
                    <Box pt={2} pb={2} textAlign="center" fontWeight="bold"
                    borderLeft="3px" borderRight='4px' borderColor='#F4F3F3'>
                    <Text h='30px'>{day}</Text>
                    {hours.map((hour, hourIndex) => (
                    <Box
                        key={hour}
                        h='30px'
                        p={2}
                        borderTop={hour.includes(':30') ? "none" : "2px"}
                        borderBottom={hour.includes(':30') ? "2px" : "none"}
                        borderColor='#F4F3F3'
                        bg={grid[dayIndex][hourIndex] ? 'rgba(220, 164, 164, 0.54)' : 'rgba(91, 145, 90, 0.54)'}
                        textAlign="center"
                        color={grid[dayIndex][hourIndex] ? 'white' : 'black'}
                    />
                    ))}
                    </Box>
                </GridItem>
                ))}
            </Grid>
        </Box>
    );
  };
  
  export default Schedule;