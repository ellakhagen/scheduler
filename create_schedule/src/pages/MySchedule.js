import React, {useEffect, useState} from 'react';
import { Box, Grid, Text, GridItem, Flex, Slider, SliderTrack,
SliderFilledTrack, SliderThumb, Button, Switch} from '@chakra-ui/react';
import {useLocation, useNavigate} from 'react-router-dom';


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
    schedule["start"] = {course_day:"MoTuWeThFr", course_start:"7:00 am", course_end:"9:00 am"}
    schedule["end"] = {course_day:"MoTuWeThFr", course_start:"5:00 pm", course_end:"6:00 pm"}
    const grid = Array.from({ length: days.length }, () => Array.from({ length: hours.length }, () => false));
    Object.values(schedule).forEach(entry => {
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
  
function MySchedule(){
    const location = useLocation();
    const {yourClasses, classFile, generatedClassFile, studentFile, generatedStudentFile} = location.state || {};
    const [grid, setGrid] = useState(generateGrid(yourClasses));
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [officeHourQuant, setOfficeHourQuant] = useState(2)
    const [officeHourLength, setOfficeHourLength] = useState(2)
    const [oncePerDay, setOncePerDay] = useState(true)
    const navigate = useNavigate();

    function handleMouseDown(dayIndex, hourIndex){
        console.log(dayIndex, hourIndex)
        setIsMouseDown(true);
        toggleGrid(dayIndex, hourIndex)
    };

    function handleMouseOver(dayIndex, hourIndex){
        if(isMouseDown){
            toggleGrid(dayIndex, hourIndex)
        }
    }
    function toggleGrid(dayIndex, hourIndex){
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            newGrid[dayIndex][hourIndex] = !prevGrid[dayIndex][hourIndex];
            return newGrid;
        });
    };

    function handleContinue(){
        navigate('/calc_time', {state: {grid, officeHourQuant, officeHourLength, oncePerDay,
            classFile, generatedClassFile, studentFile, generatedStudentFile, yourClasses}});
    }

    return (
        <Flex flexDirection='row'>
            <Box display='flex' flexDirection='column' userSelect='none' w='50%' h='100vh' 
            bg='#F4F3F3' boxShadow='base' overflow='scroll'>
                <Text fontSize='25px' fontWeight='bold' fontFamily='inter'
                    textColor='black' mt='25px' textAlign='center'>My Schedule</Text>
                <Grid templateColumns={`100px repeat(${days.length}, auto)`} w='100%' p='10px'>
                    <GridItem colSpan={1}>
                        <Box h='27px'/>
                        {hours.slice(0, -1).map((hour, index) => (
                            <Box key={index} h='40px' p={2} textAlign="center"
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
                        <Text h='40px' p='10px' overflow='hidden'>{day}</Text>
                        {hours.slice(0, -1).map((hour, hourIndex) => (
                        <Box
                            key={hour}
                            h='40px'
                            p={2}
                            borderTop={hour.includes(':30') ? "none" : "2px"}
                            borderBottom={hour.includes(':30') ? "2px" : "none"}
                            borderColor='#F4F3F3'
                            bg={grid[dayIndex][hourIndex] ? 'rgba(220, 164, 164, 0.54)' : 'rgba(91, 145, 90, 0.54)'}
                            textAlign="center"
                            onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                            onMouseEnter={() => handleMouseOver(dayIndex, hourIndex)}
                            onMouseUp={() => setIsMouseDown(false)}
                        />
                        ))}
                        </Box>
                    </GridItem>
                    ))}
                </Grid>
            </Box>
            <Flex w='50%' justifyContent='center' alignItems='center'>
                <Box bg='#F4F3F3' w='70%' minWidth='300px' h='60%' minHeight='500px' borderRadius='30px' overflow='hidden' boxShadow='base' 
                p='50px' position='relative'>
                    <Text fontSize='25px' fontWeight='bold' fontFamily='inter' textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'
                        textColor='black' mb='10px' textAlign='center'>Edit Office Hours Availability
                    </Text>
                    <Text fontFamily='inter'  mb='10px' textColor='#626161' textAlign='center'
                    textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'>
                    Click and drag to change availability
                    </Text>
                    <Text mt='40px' fontFamily='inter'  mb='20px' textColor='#626161' fontWeight='bold'>
                    Office Hour Quantity
                    </Text>
                    <Slider defaultValue={officeHourQuant} min={0} max={5} step={1}
                    onChange={(value) => setOfficeHourQuant(value)}>
                        <SliderTrack bg='red.100'>
                            <SliderFilledTrack bg='tomato' />
                        </SliderTrack>
                        <SliderThumb boxSize={6}>
                            <Box transform='translateY(125%)'>{officeHourQuant}</Box>
                        </SliderThumb>
                    </Slider>
                    <Text mt='50px' fontFamily='inter'  mb='20px' textColor='#626161' fontWeight='bold'>
                    Office Hour Length 
                    </Text>
                    <Slider defaultValue={officeHourLength} min={0} max={4} step={0.5}
                    onChange={(value) => setOfficeHourLength(value)}>
                        <SliderTrack bg='red.100'>
                            <SliderFilledTrack bg='tomato' />
                        </SliderTrack>
                        <SliderThumb boxSize={6}>
                            <Box transform='translateY(125%)'>{officeHourLength % 1 !== 0 ? `${Math.floor(officeHourLength)}:30` : `${officeHourLength}:00`}</Box>
                        </SliderThumb>
                    </Slider>  
                    <Flex direction='row' mt='70px' gap='30px'>
                        <Switch size='lg' colorScheme='red' defaultChecked={oncePerDay}
                        onChange={() => setOncePerDay(!oncePerDay)}></Switch>
                        <Text fontFamily='inter'  mb='20px' textColor='#626161' fontWeight='bold'
                        textOverflow='ellipsis' whiteSpace='nowrap' overflow='hidden'>
                        Office hours can be held only once in a day 
                        </Text>
                    </Flex>
                    
                    <Button position='absolute' right={0}  bottom={0} bg='none' _hover={{bg:'#E3E3E3'}}
                    m='50px' onClick={handleContinue}>Continue</Button>
                    
                </Box>
            </Flex>
        </Flex>
    );
  };
  
  export default MySchedule;