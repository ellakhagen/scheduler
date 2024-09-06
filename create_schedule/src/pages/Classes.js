import {useLocation, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react'
import {Box, Input, Table, Thead, Tbody, Tr, Th, Td, Button} from '@chakra-ui/react'

function ClassUpload(){
    const location = useLocation();
    const {classFile, generatedClassFile} = location.state || {};
    const [file, setFile] = useState({});
    const [courseFilter, setCourseFilter] = useState('')
    const [professorFilter, setProfessorFilter] = useState('')
    const navigate = useNavigate();

    function handleCourseFilterChange(event){
        setCourseFilter(event.target.value)
    }
    function handleProfessorFilterChange(event){
        setProfessorFilter(event.target.value);
      };

    const filteredData = Object.keys(file)
      .filter(courseCode => 
        courseCode.toUpperCase().includes(courseFilter.toUpperCase()) &&
        file[courseCode].course_instructor.toUpperCase().includes
        (professorFilter.toUpperCase())
      )
      .reduce((obj, courseCode) => {
        obj[courseCode] = file[courseCode];
        return obj;
      }, {});
    console.log("filtered", filteredData)

    function handleReturn(){
        navigate('/home')
    }
        
    
    useEffect(() => {
        if(classFile){
            setFile(classFile)
        }
        else if(generatedClassFile){
            setFile(generatedClassFile)
        }
    }, [classFile, generatedClassFile])
    
    return (
        <Box>
            <Box position='absolute' w='70%' top='100px' left='15%'>
                <Input placeholder='Filter by course code' value={courseFilter}
                onChange={handleCourseFilterChange} mb='16px'></Input>
                <Input placeholder='Filter by instructor' value={professorFilter}
                onChange={handleProfessorFilterChange} mb='16px'></Input>
                <Table variant='simple' style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Thead>
                        <Tr>
                            <Th width='13%'>Course Code</Th>
                            <Th>Course Name</Th>
                            <Th>Course Number</Th>
                            <Th>Course End</Th>
                            <Th>Course Day</Th>
                            <Th>Course Start</Th>
                            <Th>Course Instructor</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {Object.keys(filteredData).map(courseCode => {
                            const { course_name, course_number, course_day, course_start, 
                                course_end, course_instructor } = filteredData[courseCode];
                            return (
                                <Tr key={courseCode}>
                                    <Td>{courseCode}</Td>
                                    <Td >{course_name}</Td>
                                    <Td>{course_number}</Td>
                                    <Td>{course_day}</Td>
                                    <Td>{course_start}</Td>
                                    <Td>{course_end}</Td>
                                    <Td>{course_instructor}</Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );

}
export default ClassUpload